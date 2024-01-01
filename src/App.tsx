import { useEffect, useState } from "react";

function App() {
  const [grid, setGrid] = useState<Array<Number>>([]);

  const [searchType, setSearchType] = useState<String> ("bfs")

  const [isRunning, setIsRunning] = useState<Boolean>(false);

  const [isMouseDown, setIsMouseDown] = useState(false);

  const [startNode, setStartNode] = useState<Array<Number>>([5, 4]);
  const [targetNode, setTargetNode] = useState<Array<Number>>([10, 4]);

  const [type, setType] = useState<String>("start");

  const [boxColumns, setBoxColumns] = useState<Number>(0);
  const [boxRows, setBoxRows] = useState<Number>(0);

  function indexToCoords(indexNum: Number) {
    const yCoord = Math.floor(Number(indexNum) / Number(boxColumns));
    const xCoord = Number(indexNum) - yCoord * Number(boxColumns);
    return [xCoord, yCoord];
  }

  function coordsToIndex<Number>(coords: Number[]) {
    const [xCoord, yCoord] = coords;
    return Number(yCoord) * Number(boxColumns) + Number(xCoord);
  }

  function getCellClass(cellNum: Number) {
    return cellNum === 1
      ? "gridCell"
      : cellNum === 2
      ? "gridWall"
      : cellNum === 3
      ? "gridStart"
      : cellNum === 4
      ? "gridTarget"
      : cellNum === 5
      ? "gridTravelled"
      : "gridBack";
  }

  function handleSelectionChange(value: String) {
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
      });
      return newGrid;
    });
  }

  function clearWalls() {
    setGrid((prevState) => {
      const prevGrid = prevState.slice();

      const newGrid = prevGrid.map((item) => {
        if (item === 5 || item === 6 || item === 2) {
          return 1;
        } else {
          return item;
        }
      });
      return newGrid;
    });
  }


  function handleSearchChange(value: String) {
    if (isRunning) {
      return;
    }
    clearTraveledGrid();

    setSearchType(value);
  }

  function handleBoxClick(itemIndex: Number, shift: Boolean = false) {
    const startNodeIndex = coordsToIndex(startNode);
    const targetNodeIndex = coordsToIndex(targetNode);

    if (startNodeIndex === itemIndex || targetNodeIndex === itemIndex) {
      return;
    }

    if (!isRunning) {
      clearTraveledGrid();
      setGrid((prevState) => {
        const prevGrid = prevState.slice();
        const changeNum: Number =
          type === "wall"
            ? 2
            : type === "start"
            ? 3
            : type === "target"
            ? 4
            : 1;

        if (changeNum === 3) {
          prevGrid[Number(coordsToIndex(startNode))] = 1;
          setStartNode(indexToCoords(itemIndex));
        } else if (changeNum === 4) {
          prevGrid[Number(coordsToIndex(targetNode))] = 1;
          setTargetNode(indexToCoords(itemIndex));
        }

        if (shift) {
          prevGrid[Number(itemIndex)] = 1;
          return prevGrid;
        } else {
          prevGrid[Number(itemIndex)] =
            changeNum === prevGrid[Number(itemIndex)] ? 1 : changeNum;
          return prevGrid;
        }

      });
    }
  }
  function handleBoxHold(itemIndex: Number, shift: Boolean = false) {
    const startNodeIndex = coordsToIndex(startNode);
    const targetNodeIndex = coordsToIndex(targetNode);

    if (startNodeIndex === itemIndex || targetNodeIndex === itemIndex) {
      return;
    }

    if (!isRunning) {
      clearTraveledGrid();
      setGrid((prevState) => {
        const prevGrid = prevState.slice();
        const changeNum: Number =
          type === "wall"
            ? 2
            : type === "start"
            ? 3
            : type === "target"
            ? 4
            : 1;
        if (shift) {
          prevGrid[Number(itemIndex)] = 1;
          return prevGrid;
        } else {
          if (changeNum === 2) {

            prevGrid[Number(itemIndex)] =
              changeNum === prevGrid[Number(itemIndex)] ? 1 : changeNum;
            return prevGrid;
          }
        }
        return prevGrid;
      });
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
    if (Number(nodeIndex[0]) > Number(boxColumns) - 1) return false;
    if (Number(nodeIndex[1]) < 0) return false;
    if (Number(nodeIndex[1]) > Number(boxRows) - 1) return false;
    return true;
  }

  function generateMaze() {
    if (isRunning) return;
    clearWalls();

    const travelledNodes = new Set();
    travelledNodes.clear();
    const operationStack: GridNode[] = [];
    operationStack.push(new GridNode(0,0));


    

    let currNode;
    while(operationStack.length !== 0) {
      currNode = operationStack.pop();
      const nX = Number(currNode?.x);
      const nY = Number(currNode?.y);
      
      const nodeIndex = coordsToIndex([currNode?.x, currNode?.y]);
      

      if (travelledNodes.has(coordsToIndex([nX, nY]))) {
        continue;
      }
      travelledNodes.add(nodeIndex);
      if (currNode?.prevNode) {
        if (nX - Number(currNode.prevNode.x) != 0) {
          if (nX - Number(currNode.prevNode.x) > 0) travelledNodes.add(coordsToIndex([nX - 1, nY]));
          else travelledNodes.add(coordsToIndex([nX + 1, nY]));
        }
        else if (nY - Number(currNode.prevNode.y) != 0){
          if (nY - Number(currNode.prevNode.y) > 0) travelledNodes.add(coordsToIndex([nX, nY - 1]));
          else travelledNodes.add(coordsToIndex([nX, nY + 1]));
        }
      }

      let nodeSides = [[nX + 2, nY], [nX, nY + 2], [nX - 2, nY], [nX, nY - 2]];
      
      nodeSides = nodeSides.filter((side) => {
        if (checkOOB(side) && !travelledNodes.has(coordsToIndex(side))) return true;
        return false;
      })
      
      if (nodeSides.length === 0) continue;


      const randomSide = Math.floor(Math.random() * nodeSides.length);

      for (let i = 0; i < nodeSides.length; i++) {
        if (i !== randomSide) {
          operationStack.push(new GridNode(nodeSides[i][0], nodeSides[i][1], currNode));
        }
      }

      const chosenSide = nodeSides[randomSide];

      const xDiff = chosenSide[0] - nX;
      const yDiff = chosenSide[1] - nY;

      if (xDiff != 0) {
        if (xDiff > 0) travelledNodes.add(coordsToIndex([nX + 1, nY]));
        else travelledNodes.add(coordsToIndex([nX - 1, nY]));
      }
      else {
        if (yDiff > 0) travelledNodes.add(coordsToIndex([nX, nY + 1]));
        else travelledNodes.add(coordsToIndex([nX, nY - 1]));
      }

        operationStack.push(new GridNode(chosenSide[0], chosenSide[1], currNode));
      
    }

    setGrid((prevState) => {
      const prevGrid = prevState.slice();
      for (let i = 0; i < grid.length; i++) {
        if (!travelledNodes.has(i) && i !== coordsToIndex(startNode) && i !== coordsToIndex(targetNode)) prevGrid[i] = 2;
      }

      return prevGrid;
    })
  }


  async function startSimulation() {
    if (isRunning) return;
    if (!checkOOB(startNode)) return;
    if (!checkOOB(targetNode)) return;

    clearTraveledGrid();
    setIsRunning(true);

    const travelledSet = new Set();
    const operationStack: GridNode[] = [];

    operationStack.push(new GridNode(startNode[0], startNode[1]));

    let targetNodeReached = false;
    let count = 0;
    while (!targetNodeReached && operationStack.length > 0) {
      count++;
      let currNode;
      
      if (searchType === 'bfs') {
        currNode = operationStack.shift();
      } else {
        currNode = operationStack.pop();
      }
      
      const nodeCoords = [Number(currNode?.x), Number(currNode?.y)];
      const nodeIndex = coordsToIndex(nodeCoords);
      if (
        currNode &&
        (currNode?.x !== targetNode[0] || currNode?.y !== targetNode[1])
      ) {
        if (
          !travelledSet.has(nodeIndex) &&
          grid[nodeIndex] !== 2 &&
          checkOOB(nodeCoords)
        ) {
          travelledSet.add(nodeIndex);
          operationStack.push(
            new GridNode(Number(currNode?.x), Number(currNode.y) + 1, currNode)
          );
          operationStack.push(
            new GridNode(Number(currNode?.x) + 1, Number(currNode.y), currNode)
          );
          operationStack.push(
            new GridNode(Number(currNode?.x) - 1, Number(currNode.y), currNode)
          );
          operationStack.push(
            new GridNode(Number(currNode?.x), Number(currNode.y) - 1, currNode)
          );
          setTimeout(()=> {
            setGrid((prevState) => {
              const prevGrid = prevState.slice();
              prevGrid[nodeIndex] =
                prevGrid[nodeIndex] !== 4 && prevGrid[nodeIndex] !== 3
                  ? 5
                  : prevGrid[nodeIndex];
              return prevGrid;
            });
            
          }, 2 * count);
        }
      } else {
        targetNodeReached = true;
        await new Promise((resolve) => {
          setTimeout(resolve, count * 2)
        } )
        while (currNode?.prevNode !== null) {

          const nodeIndex = coordsToIndex([
            Number(currNode?.x),
            Number(currNode?.y),
          ]);
          setGrid((prevState) => {
              const prevGrid = prevState.slice();
              prevGrid[nodeIndex] =
                prevGrid[nodeIndex] !== 4 && prevGrid[nodeIndex] !== 3
                  ? 6
                  : prevGrid[nodeIndex];
              return prevGrid;
          });
          
          currNode = currNode?.prevNode;
          await new Promise((resolve) => {
            setTimeout(resolve, 10)
          } )
        }
      }
    }
    setIsRunning(false);
  }

  function clearGrid() {
    if (!isRunning) clearTraveledGrid();
  }  

  function generateGrid() {
    const documentHeight = document.documentElement.clientHeight;
    const documentWidth = document.documentElement.clientWidth;
    const boxRows = Math.floor(documentHeight / 23) - 3;
    const boxColumns = Math.floor(documentWidth / 23);

    setBoxColumns(boxColumns);
    setBoxRows(boxRows);

    const tempGrid: number[] = [];

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
  }

  useEffect(() => {
    window.addEventListener("resize", () => {
      window.location.reload();
    });
    generateGrid();
  }, []);
  useEffect(() => {
    function handleMouseDown() {
      setIsMouseDown(true);
    }

    function handleMouseUp() {
      setIsMouseDown(false);
    }
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

  }, []);

  return (
    <div className="App">
      <div className="header">
        <img src="/DFS-BFS-Visualization/logo.png" className="logoImage" alt="logo"/>
        <h1 className="headerText">BFS DFS Visualization</h1>
        <button
          className="btn generateMazeButton"
          onClick={() => {
            generateMaze();
          }}
          >Generate Maze</button>
        <div className="colorLabels">
          <ul className="labelList">
            <li className="labelItem">
              <div className="gridCellItem gridStart listLabel"></div>
              <h3 className="labelText">Start</h3>
            </li>
            <li className="labelItem">
              <div className="gridCellItem gridTarget listLabel"></div>
              <h3 className="labelText">Target</h3>
            </li>
            <li className="labelItem">
              <div className="gridCellItem gridWall listLabel"></div>
              <h3 className="labelText">Wall</h3>
            </li>
            <li className="labelItem ">
              <div className="gridCellItem gridTravelled listLabel"></div>
              <h3 className="labelText">Travelled</h3>
            </li>
            <li className="labelItem">
              <div className="gridCellItem gridBack listLabel"></div>
              <h3 className="labelText">Path</h3>
            </li>
          </ul>
          
        </div>
        <div className="controls">
          <div>
            <div>
              <label>Set Cell: </label>
              <select
                className="selectCellType"
                onChange={(e) => {
                  handleSelectionChange(e.target.value);
                }}
              >
                <option value="start">Start</option>
                <option value="wall">Wall</option>
                <option value="target">Target</option>
              </select>
            </div>
            <div>
            <label>Search Type: </label>
              <select
                className="selectCellType"
                onChange={(e) => {
                  handleSearchChange(e.target.value);
                }}
              >
                <option value="bfs">BFS</option>
                <option value="dfs">DFS</option>
              </select>
            </div>
          </div>
          <div className="buttons">
            <button className="btn clear-btn" onClick={() => {
              clearGrid();
            }}>
            Clear Grid
            </button>
            <button
              className="btn" onClick={() => {
                startSimulation();
              }}
            >
              Start Simulation
            </button>
          </div>

        </div>
      </div>
      <div draggable="false" className="gridContainer">
        {!grid.length ||
          grid.map((item, index) => {
            return (
              <div
              draggable="false"
                className={`${getCellClass(item)} gridCellItem`}
                onMouseOver={(e) => {
                  if (isMouseDown) {
                    handleBoxHold(Number(index), e.shiftKey);
                  }
                }}
                onMouseDown={() => {
                  handleBoxClick(Number(index));
                }}

              ></div>
            );
          })}
      </div>
    </div>
  );
}

export default App;
