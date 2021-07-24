import React, { useEffect, useState } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  removeElements,
  Controls,
  isNode,
  Elements,
  Connection,
  Edge,
  NodeExtent,
  Position,
  XYPosition
} from 'react-flow-renderer';
import dagre from 'dagre';

const position: XYPosition = { x: 0, y: 0 };
//import initialElements from './initial-elements';
const initialElements = [
  {
    id: '1',
    type: 'input',
    data: { label: 'label' },
    position,
  },
]

import styles from './styles.module.scss';
import { api } from '../../services/api'
import { GetServerSideProps } from 'next';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeExtent: NodeExtent = [
  [0, 0],
  [1000, 1000],
];

interface IOrderSummary {
  ProdOP: string;
  CC: string;
  AnoMes: string;
  CF: string;
  TM: string;
  Produto: string;
  Descricao: string;
  Tipo: string;
  Qtde: number;
  CustUnit: number;
  CustoTotal: number;
  Material: number;
  MaoDeObra: number;
  GGF: number;
}

interface IPropsLayoutFlow {
  elementsFlow: Elements;
}

const LayoutFlow = ({elementsFlow}: IPropsLayoutFlow) => {
  const [elements, setElements] = useState<Elements>(initialElements);
  const onConnect = (params: Connection | Edge) => setElements((els) => addEdge(params, els));
  const onElementsRemove = (elementsToRemove: Elements) => setElements((els) => removeElements(elementsToRemove, els));

  useEffect( () => {
      setElements(elementsFlow)
  },[])

  const onLayout = (direction: string) => {
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction });

    elements.forEach((el) => {
      if (isNode(el)) {
        dagreGraph.setNode(el.id, { width: 250, height: 150 });
      } else {
        dagreGraph.setEdge(el.source, el.target);
      }
    });

    dagre.layout(dagreGraph);

    const layoutedElements = elements.map((el) => {
      if (isNode(el)) {
        const nodeWithPosition = dagreGraph.node(el.id);
        el.targetPosition = isHorizontal ? Position.Left : Position.Top;
        el.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;
        // we need to pass a slighltiy different position in order to notify react flow about the change
        // @TODO how can we change the position handling so that we dont need this hack?
        el.position = { x: nodeWithPosition.x + Math.random() / 1000, y: nodeWithPosition.y };
      }

      return el;
    });

    setElements(layoutedElements);
  };

  const graphStyles = { width: "100%", height: "650px" };

  return (
    <div className={styles.layoutflow}>
      <ReactFlowProvider>
        <ReactFlow
          elements={elements}
          onConnect={onConnect}
          onElementsRemove={onElementsRemove}
          nodeExtent={nodeExtent}
          style={graphStyles}
          onLoad={() => onLayout('TB')}
        >
          <Controls />
        </ReactFlow>
        <div className={styles.controls}>
          <button onClick={() => onLayout('TB')} style={{ marginRight: 10 }}>
            vertical layout
          </button>
          <button onClick={() => onLayout('LR')}>horizontal layout</button>
        </div>
      </ReactFlowProvider>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ( { req, params }) => {
  const response = await api.get(`/order?anoMes=202105`);
  const { resumoOPList } = response.data;

  const orders = resumoOPList as IOrderSummary[]
  const elementsFlow = orders
    .filter(order => ['PA', 'PI', 'MP'].includes(order.Tipo))
    .map( item => ({
      id: item.Produto,
      data: { label: `${item.Descricao}` },
      position: { x: 0, y: 0 },
    }));

  const filteredArr = elementsFlow.reduce((acc, current) => {
      const x = acc.find(item => item.id === current.id);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);

  const edgeFlow = orders
    .filter(order => ['PA', 'PI', 'MP'].includes(order.Tipo))
    .map( item => ({
      id: `${item.Produto} to ${item.ProdOP}`,
      source: item.Produto,
      target: item.ProdOP,
      animated: true,
      type: 'smoothstep',
    }));

  return {
    props: {
      elementsFlow: [...filteredArr, ...edgeFlow]
    }
  }
}


export default LayoutFlow;
