import React, { useEffect, useState, useRef  } from 'react';
import ReactFlow, {
  useZoomPanHelper,
  ReactFlowProvider,
  addEdge,
  removeElements,
  Controls,
  isNode,
  Background,
  Elements,
  Connection,
  Edge,
  MiniMap,
  NodeExtent,
  Position,
  XYPosition,
} from 'react-flow-renderer';
import dagre from 'dagre';
import ReactToPrint from 'react-to-print';

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

const onElementClick = (event, element) => console.log('click', element);

const backgroundNodeColor = (centroCusto: string) => {
  switch (centroCusto.substr(0, 3)) {
    case '031': return  '#90CDF4'; //Mineracao 031
    case '032': return  '#4299E1'; //Tratamento de Minerio 032
    case '033': return  '#2B6CB0'; //Moagem de Talco 033
    case '034': return  '#385072'; //Moagem de Magnesita 034
    case '036': return  '#0BC5EA'; //Forno MHF 036
  }
}

const LayoutFlow = () => {
  const componentRef = useRef();

  const [elements, setElements] = useState<Elements>(initialElements);
  const [ periods, setPeriods ] = useState(['']);
  const [ activePeriod, setActivePeriod ] = useState(-1);

  const onConnect = (params: Connection | Edge) => setElements((els) => addEdge(params, els));
  const onElementsRemove = (elementsToRemove: Elements) => setElements((els) => removeElements(elementsToRemove, els));

  const numberFormat = (number: number) => (
    new Intl.NumberFormat('pt-BR').format(number)
  )

  const currencyFormat = (number: number) => (
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(number)
  )

  const myLabel = (item: IOrderSummary) => {
    return (
      <>
        [{item.Tipo}] {item.Produto} {item.Descricao} <br/>
        <a href='#'  style={ {color: '#be2'}}>{item.CC} </a> {item.AnoMes} <br/>
        Qtde: {numberFormat(item.Qtde)} |
        CM: {currencyFormat(item.CustUnit)} |
        Total: {currencyFormat(item.CustoTotal)} <br/>
        MAT: {currencyFormat(item.Material)} |
        MO: {currencyFormat(item.MaoDeObra)} |
        GGF: {currencyFormat(item.GGF)}
      </>)
  }

  const loadOrders = async (yearMonth: string) => {

    const {resumoOPList} = await (await api.get(`/order?anoMes=${yearMonth}`)).data;

    const orders = resumoOPList as IOrderSummary[]
    const elementsFlow = orders
      .filter(
        item => ['PA', 'PI', 'MP'].includes(item.Tipo),
      )
      .map( item => ({
        id: item.Produto,
        data: { label: myLabel(item) },
        position: { x: 0, y: 0 },
        style: {
          width: '20rem',
          background: `${backgroundNodeColor(item.CC)}`,
          color: '#ffffff',
          border: `${item.Tipo === 'PA' ? '4px solid #b43a3a' : '2px solid #4759c0'}`
        },
      }))
      //remove duplicates
      .reduce((acc, current) => {
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
        //label: `${item.Produto} -> ${item.ProdOP}`,
        //type: 'smoothstep',
        arrowHeadType: "arrowclosed",
        style: {
          stroke: '#4759c0' ,
        },
      }))
      //remove duplicates
      .reduce((acc, current) => {
        const x = acc.find(item => item.id === current.id);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, []);

      setElements([...elementsFlow, ...edgeFlow])
  }

  async function loadPeriods() {
    const response = await api.get(`/last-balance`);
    const { lastsPeriods } = await response.data;
    setPeriods(lastsPeriods);
    setActivePeriod(0);
    loadOrders(periods[activePeriod])
  }

  useEffect( () => {
    loadPeriods();
  },[])

  useEffect( () => {
    loadOrders(periods[activePeriod]);
    onLayout('TB');
  },[activePeriod])


  const onLayout = (direction: string) => {
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction });

    elements.forEach((el) => {
      if (isNode(el)) {
        dagreGraph.setNode(el.id, { width: 500, height: 500 });
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

  const graphStyles = { width: "100%", height: "90vh" };

  return (
    <div className={styles.layoutflow}>

      <ReactFlowProvider >
        <ReactFlow
          ref={componentRef}
          elements={elements}
          onConnect={onConnect}
          elementsSelectable={true}
          onElementsRemove={onElementsRemove}
          onElementClick={onElementClick }
          nodeExtent={nodeExtent}
          style={graphStyles}
          onLoad={() => onLayout('TB')}
          maxZoom={5}
          minZoom={0.1}
        >
          <Controls />
          { /*<MiniMap /> */ }
          { /*<Background /> */}
        </ReactFlow>
        <div className={styles.controls}>
          Período:
          { activePeriod < 11 &&
            <button onClick={()=>setActivePeriod(activePeriod+1)} style={{ marginLeft: 10, marginRight: 10 }}>{`<`}</button>
          }
          { periods[activePeriod] ?
            `${periods[activePeriod].substr(4,2)}/${periods[activePeriod].substr(0,4)}`
            : ``
          }
          { activePeriod > 0 &&
            <button onClick={()=>setActivePeriod(activePeriod-1)}style={{ marginRight: 10, marginLeft: 10 }}>{`>`}</button>
          }
          <button onClick={() => onLayout('TB')} style={{ marginLeft: 10, marginRight: 10 }}>
            vertical
          </button>
          <button onClick={() => onLayout('LR')} style={{ marginRight: 10 }} >horizontal</button>
          <ReactToPrint
            trigger={() => <button>Print</button>}
            content={() => componentRef.current}
          />
        </div>
      </ReactFlowProvider>
    </div>
  );
};

export default LayoutFlow;
