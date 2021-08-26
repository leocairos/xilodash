import React from 'react';
import { useStoreState, useStoreActions } from 'react-flow-renderer';

const Sidebar = () => {
  const nodes = useStoreState((store) => store.nodes);
  const setSelectedElements = useStoreActions((actions) => actions.setSelectedElements);

  const selectAll = () => {
    const nodesSelected = nodes
      .map((node) => {
        return { id: node.id, type: node.type }
      })
      .filter( node => node.id.substr(0,3) === "018" )
    setSelectedElements(nodesSelected)
  };

  return (
    <aside>
      <div className="selectall">
        <button onClick={selectAll}>select all nodes</button>
      </div>
    </aside>
  );
};

export default Sidebar;
