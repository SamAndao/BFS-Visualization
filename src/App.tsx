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
    index: Number;
    prevNode: GridNode | null;
    constructor(index: Number, prevNode?: GridNode) {
      this.index = index;
      this.prevNode = prevNode ?? null;
    }
  }

  async function startSimulation() {
    clearTraveledGrid();
    setIsRunning(true);

    const targetIndex = coordsToIndex(targetNode);
    const travelledSet = new Set();
    const operationStack:GridNode[] = [];

    operationStack.push(new GridNode(coordsToIndex(startNode)));

    let targetNodeReached = false;

    while (!targetNodeReached && operationStack.length > 0) {
      let currNode = operationStack.shift();
      
      if (currNode && currNode.index !== targetIndex) {

        const indexNumber = Number(currNode.index);
        setGrid((prevState) => {
          const prevGrid = prevState.slice();
          prevGrid[indexNumber] = prevGrid[indexNumber] !== 2 && prevGrid[indexNumber] !== 3 ? 5 : prevGrid[indexNumber];
          return prevGrid;
        })

        const sideCells: Number[] = [indexNumber - boxColumns, indexNumber + 1, indexNumber + boxColumns, indexNumber - 1];
        for (let i = 0; i < 4; i++ ) {
          if(!travelledSet.has(sideCells[i]) && Number(sideCells[i]) < grid.length && Number(sideCells[i]) >= 0 && grid[Number(sideCells[i])] !== 2) {
            if (i === 1) {
              if (Number(sideCells[i]) % boxColumns !== 0) {
                travelledSet.add(sideCells[i]);
                operationStack.push(new GridNode(sideCells[i], currNode));
              }
            } else if (i ===3) {
              if (Number(sideCells[i]) % boxColumns !== boxColumns - 1) {
                travelledSet.add(sideCells[i]);
                operationStack.push(new GridNode(sideCells[i], currNode));
              }
            } else {
              travelledSet.add(sideCells[i]);
              operationStack.push(new GridNode(sideCells[i], currNode));
            }
            
          } 
        }



      await new Promise((resolve) => setTimeout(resolve, 20));
      } else {

        targetNodeReached = true;
        while (currNode?.prevNode !== null) {
          console.log('hi')
          setGrid((prevState) => {
            const prevGrid = prevState.slice();
            prevGrid[Number(currNode?.index)] = prevGrid[Number(currNode?.index)] !== 4 && prevGrid[Number(currNode?.index)] !== 3 ? 6 : prevGrid[Number(currNode?.index)];
            return prevGrid;
          })
          await new Promise((resolve) => setTimeout(resolve, 10));
          currNode = currNode?.prevNode
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
