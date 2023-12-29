import { useEffect, useState } from "react";

function App() {
  const [grid, setGrid] = useState<Array<Number>>([]);

  const [isRunning, setIsRunning] = useState<Boolean> (false);

  const [startNode, setStartNode] = useState<Array<Number>>([10 , 5]);
  const [targetNode, setTargetNode] = useState<Array<Number>>([30, 5]);

  const [type, setType] = useState<String>("start");

  const documentHeight = document.documentElement.clientHeight;
  const documentWidth = document.documentElement.clientWidth;
  const boxRows = Math.floor(documentHeight / 23) - 3;
  const boxColumns = Math.floor(documentWidth / 23);

  function indexToCoords (indexNum: Number) {
    const yCoord = Math.floor(Number(indexNum) / boxColumns);
    const xCoord = Number(indexNum) - (yCoord * boxColumns);
    return [xCoord, yCoord];

  }

  function coordsToIndex (coords: Number[]) {
    const [xCoord, yCoord] = coords;
    return (Number(yCoord) * Number(boxColumns)) + Number(xCoord);
  }


  function getCellClass( cellNum: Number) {
    return cellNum === 1 ? "gridCell" : cellNum === 2 ? "gridWall" : cellNum === 3 ? "gridStart" : cellNum === 4 ? "gridTarget" : cellNum === 5 ? "gridTravelled" : "gridBack";
  }

  function handleSelectionChange(value:String) {
    setType(value);
  }


  function clearTraveledGrid() {
    setGrid((prevState) => {
      const prevGrid = prevState.slice();

      const newGrid = prevGrid.map((item) => {
        if (item === 5 || item === 6) {
          return 1;
        } else {
          return item;
        }
      })
      return newGrid;
    })
  }

  function handleBoxClick( itemIndex: Number) {
    const startNodeIndex = coordsToIndex(startNode);
    const targetNodeIndex = coordsToIndex(targetNode);

    if (startNodeIndex === itemIndex || targetNodeIndex === itemIndex) {
      return;
    }
    
    if (!isRunning) {
      clearTraveledGrid();
      setGrid((prevState) => {
        const prevGrid = prevState.slice();
        const changeNum:Number = type === "wall" ? 2 : type === "start" ? 3 : type === "target" ? 4 : 1;
  
        if (changeNum === 3) {
          prevGrid[Number(coordsToIndex(startNode))] = 1;
          setStartNode(indexToCoords(itemIndex));
        } else if (changeNum === 4) {
          prevGrid[Number(coordsToIndex(targetNode))] = 1;
          setTargetNode(indexToCoords(itemIndex));
        }
  
        prevGrid[Number(itemIndex)] = changeNum === prevGrid[Number(itemIndex)] ? 1 : changeNum;
        return prevGrid;
      })
    }
  }

  

  class GridNode {
    x: Number;
    y: Number;
    prevNode: GridNode | null;
    constructor(x: Number, y: Number, prevNode?: GridNode) {
      this.x = x;
      this.y = y;
      this.prevNode = prevNode ?? null;
    }
  }

  function checkOOB(nodeIndex: Number[]) {
    if (Number(nodeIndex[0]) < 0) return false;
    if (Number(nodeIndex[0]) > boxColumns) return false;
    if (Number(nodeIndex[1]) < 0) return false;
    if (Number(nodeIndex[1]) > boxRows - 1) return false;
    return true;
  }

  async function startSimulation() {
    clearTraveledGrid();
    setIsRunning(true);

    const travelledSet = new Set();
    const operationStack:GridNode[] = [];

    operationStack.push(new GridNode(startNode[0], startNode[1]));

    let targetNodeReached = false;

    while (!targetNodeReached && operationStack.length > 0) {
      let currNode = operationStack.shift();
      const nodeCoords = [Number(currNode?.x), Number(currNode?.y)];
      const nodeIndex = coordsToIndex(nodeCoords);

      if (currNode && (currNode?.x !== targetNode[0] || currNode?.y !== targetNode[1])) {
        
        if (!travelledSet.has(nodeIndex) && grid[nodeIndex] !== 2 && checkOOB(nodeCoords)){

          travelledSet.add(nodeIndex);
          operationStack.push(new GridNode(Number(currNode?.x), Number(currNode.y) + 1, currNode));
          operationStack.push(new GridNode(Number(currNode?.x) + 1, Number(currNode.y), currNode));
          operationStack.push(new GridNode(Number(currNode?.x) - 1, Number(currNode.y), currNode));
          operationStack.push(new GridNode(Number(currNode?.x), Number(currNode.y) - 1, currNode));
          setGrid((prevState) => {
            const prevGrid = prevState.slice();
            prevGrid[nodeIndex] = prevGrid[nodeIndex] !== 4 && prevGrid[nodeIndex] !== 3 ? 5 : prevGrid[nodeIndex];
            return prevGrid;
          })
          await new Promise((resolve) => setTimeout(resolve, 1));
        }
      } else {
        console.log('trig')
        targetNodeReached = true;
        while (currNode?.prevNode !== null) {
          console.log('hi')
          setGrid((prevState) => {
            const nodeIndex = coordsToIndex([Number(currNode?.x), Number(currNode?.y)])
            const prevGrid = prevState.slice();
            prevGrid[nodeIndex] = prevGrid[nodeIndex] !== 4 && prevGrid[nodeIndex] !== 3 ? 6 : prevGrid[nodeIndex];
            return prevGrid;
          })
          await new Promise((resolve) => setTimeout(resolve, 10));
          currNode = currNode?.prevNode;
        }
        setIsRunning(false);
        
      }
    }

  }

  useEffect(() => {
    const tempGrid:number[] = [];

    for (let i = 0; i < boxRows; i++) {
      for (let j = 0; j < boxColumns; j++) {
        if (startNode[0] === j && startNode[1] === i) {
          tempGrid.push(3);
        } else if (targetNode[0] === j && targetNode[1] === i) {
          tempGrid.push(4);

        } else {
          tempGrid.push(1);
        }
      }
    }
    setGrid(tempGrid);
  }, []);

  return (
    <div className="App">
      <div className="header">
        <select onChange={(e) => {
          handleSelectionChange(e.target.value);
        }}>
          <option value="start">Start</option>
          <option value="wall">Wall</option>
          <option value="target">Target</option>
        </select>
        <button onClick={() => { startSimulation()}}>Start Simulation</button>
      </div>
      <div className="gridContainer">
        {!grid.length ||
          grid.map((item, index) => {
            return (
              <div
                className={`${getCellClass(item)} gridCellItem`}
                onMouseDown={ (e) => {
                  handleBoxClick(Number(index));
                }}
              >
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default App;
