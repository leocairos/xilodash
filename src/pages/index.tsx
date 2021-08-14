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
import { FiPrinter, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ReactToPrint from 'react-to-print';

const position: XYPosition = { x: 0, y: 0 };
const initialElements = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Carregando...' },
    position,
  },
]

import styles from './styles.module.scss';
import { backgroundNodeColor, borderNodeColor, currencyFormat } from '../util/format';
import { IOrderSummary } from '../util/IOrderSummary';
import { OrderDetail } from '../components/OrderDetail';

import { GiVerticalFlip, GiHorizontalFlip } from "react-icons/gi";
import { api } from '../services/api';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const OrderFlow = () => {
  const componentRef = useRef();

  const [elements, setElements] = useState<Elements>(initialElements);
  const [ periods, setPeriods ] = useState(['']);
  const [ activePeriod, setActivePeriod ] = useState(-1);

  const onConnect = (params: Connection | Edge) => setElements((els) => addEdge(params, els));
  const onElementsRemove = (elementsToRemove: Elements) => setElements((els) => removeElements(elementsToRemove, els));
  const onElementClick = (event, element) => {
    //console.log('click', element);
  };

  const loadOrders = async (yearMonth: string) => {

    const {resumoOPList} = await (await api.get(`/order?anoMes=${yearMonth}`)).data;

    const orders = resumoOPList as IOrderSummary[]
    const MOandGGF = orders
      .filter(item => ['CUSTOS-GGF', 'CUSTOS-MO'].includes(item.Produto))
      .map(
        item => ({ProdOP: item.ProdOP, Produto: item.Produto, CustoTotal: item.CustoTotal })
      );

    const material = orders
      .filter(item => !['CUSTOS-GGF', 'CUSTOS-MO'].includes(item.Produto))
      .filter(item => !['PA', 'PI', 'MP'].includes(item.Tipo))
      .map(
        item => ({ProdOP: item.ProdOP, Produto: item.Produto, CustoTotal: item.CustoTotal })
      );

    const elementsFlow = orders
      .filter(item => ['PA', 'PI', 'MP'].includes(item.Tipo))
      .map(
        item => {
          const mo = MOandGGF
            .filter(
              itemMOGGF => itemMOGGF.ProdOP === item.ProdOP && itemMOGGF.Produto === "CUSTOS-MO")
          const ggf = MOandGGF
            .filter(
              itemMOGGF => itemMOGGF.ProdOP === item.ProdOP && itemMOGGF.Produto === "CUSTOS-GGF")
          const materialFase = material
            .filter(
              itemMat => itemMat.ProdOP === item.ProdOP)
            .reduce(
              (acc, item) => acc + item.CustoTotal, 0
            );

          const detail = orders
            .filter(
              itemDetail => itemDetail.ProdOP === item.ProdOP && itemDetail.Produto !== item.ProdOP)
              .map(
                item => ({
                  Produto: item.Produto,
                  Descricao: item.Descricao,
                  Qtde: item.Qtde,
                  CustoTotal: item.CustoTotal
                })
              );

          return {
            ...item,
            moFase: mo.length>0 ? mo[0].CustoTotal : 0,
            ggfFase: ggf.length>0 ? ggf[0].CustoTotal : 0,
            materialFase,
            detail,
          }
        }
      )
      .map( item => ({
        id: item.Produto,
        //data: { label: MyNodeLabel(item) },
        data: { label: OrderDetail(item) },
        position: { x: 0, y: 0 },
        style: {
          width: '20rem',
          background: `${backgroundNodeColor(item.CC)}`,
          color: '#ffffff',
          border: `${borderNodeColor(item.CC, item.Tipo, item.Produto)}`
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
        label: `${currencyFormat(item.CustUnit)}`,
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
          nodeExtent={[ [0, 0], [10, 10] ]}
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
            <button onClick={()=>setActivePeriod(activePeriod+1)} style={{ marginLeft: 10, marginRight: 10 }}><FiChevronLeft/></button>
          }
          { periods[activePeriod] ?
            `${periods[activePeriod].substr(4,2)}/${periods[activePeriod].substr(0,4)}`
            : ``
          }
          { activePeriod > 0 &&
            <button onClick={()=>setActivePeriod(activePeriod-1)}style={{ marginRight: 10, marginLeft: 10 }}><FiChevronRight/></button>
          }
          <button onClick={() => onLayout('TB')} style={{ marginLeft: 10, marginRight: 10 }}>
            <GiVerticalFlip/>
          </button>
          <button onClick={() => onLayout('LR')} style={{ marginRight: 10 }} ><GiHorizontalFlip/></button>
          <ReactToPrint
            trigger={() => <button><FiPrinter/></button>}
            content={() => componentRef.current}
          />
        </div>
      </ReactFlowProvider>

    </div>
  );
};

export default OrderFlow;
