import { useEffect, useState } from "react";

function App() {
  const [matrix, setMatrix] = useState<number[][]>([]);
  // eslint-disable-next-line
  const [matrixWidth, setMatrixWidth] = useState<number>(15);
  // eslint-disable-next-line
  const [matrixLength, setMatrixLength] = useState<number>(15);
  const [selectedNodeType, setSelectedNodeType] = useState<number>(1);
  const [searchType, setSearchType] = useState<number>(0);
  const [rendered, setRendered] = useState<boolean>(false);

  const [startNode, setStartNode] = useState<number[]>([5, 3]);
  const [endNode, setEndNode] = useState<number[]>([5, 11]);
  const [wallNodes, setWallNodes] = useState<Set<string>>(new Set());

  const [isRunning, setIsRunning] = useState<boolean>(false);

  const gridItemColorClass = (gridItemNumberState: number) => {
    switch (gridItemNumberState) {
      case 0:
        return "grid-open";
      case 1:
        return "grid-start";
      case 2:
        return "grid-end";
      case 3:
        return "grid-blocked";
      case 4:
        return "grid-travelled";
      case 5:
        return "grid-end-reached";
      case 6:
        return "grid-end-reached";
    }
  };

  const indexToMatrixValue = (indexNumber: number, length: number) => {
    const resultArr: number[] = [];
    resultArr[0] = Math.floor(indexNumber / length);
    const widthNodes = length * resultArr[0];
    resultArr[1] = indexNumber - widthNodes;
    return resultArr;
  };

  const addRemoveWallNode = (x: number, y: number) => {
    const node = `${x} ${y}`;
    const newSet = wallNodes;
    if (newSet.has(node)) {
      newSet.delete(node);
    } else {
      newSet.add(node);
    }
    setWallNodes(newSet);
  };

  const hasBeenSearched = () => {
    for (let arr of matrix) {
      for (let item of arr) {
        if (item === 4) return true;
      }
    }
    return false;
  };

  const handleGridItemClick = (index: number) => {
    // b is x, a is y
    const [a, b] = indexToMatrixValue(index, matrixLength);
    const newMatrix = hasBeenSearched() ? createMatrix() : matrix.slice();
    if (selectedNodeType === 1) {
      const indexOfFoudNode = newMatrix.flat().indexOf(1);
      if (indexOfFoudNode !== -1) {
        const [aFound, bFound] = indexToMatrixValue(
          indexOfFoudNode,
          matrixLength
        );
        if (!(aFound === a && bFound === b)) {
          newMatrix[aFound][bFound] = 0;
        }
      }
    }
    if (selectedNodeType === 2) {
      const indexOfFoudNode = newMatrix.flat().indexOf(2);
      if (indexOfFoudNode !== -1) {
        const [aFound, bFound] = indexToMatrixValue(
          indexOfFoudNode,
          matrixLength
        );
        if (!(aFound === a && bFound === b)) {
          newMatrix[aFound][bFound] = 0;
        }
      }
    }
    if (newMatrix[a][b] === selectedNodeType) {
      newMatrix[a][b] = 0;
      if (selectedNodeType === 1) setStartNode([]);
      if (selectedNodeType === 2) setEndNode([]);
      if (selectedNodeType === 3) {
        addRemoveWallNode(b, a);
      }
    } else {
      newMatrix[a][b] = selectedNodeType;
      if (startNode[0] === a && startNode[1] === b) {
        setStartNode([]);
      }
      if (endNode[0] === a && endNode[1] === b) {
        setEndNode([]);
      }
      if (selectedNodeType === 1) setStartNode([a, b]);
      if (selectedNodeType === 2) setEndNode([a, b]);
      if (selectedNodeType === 3) {
        addRemoveWallNode(b, a);
      }
    }
    setMatrix(newMatrix);
  };

  class Node {
    x: number;
    y: number;
    prev: Node | null;
    constructor(x: number, y: number, prev: Node | null) {
      this.x = x;
      this.y = y;
      this.prev = prev;
    }
  }

  const handleBacktracking = async (node: Node) => {
    let curr = node;

    await new Promise((resolve) => setTimeout(resolve, 200)); // Delay

    while (curr.prev !== null) {
      if (curr.prev.prev === null) break;

      const { x, y } = curr.prev;
      // set color;

      setMatrix((prevMatrix) => {
        const newMatrix = [...prevMatrix];
        newMatrix[y][x] = 6;
        return newMatrix;
      });
      await new Promise((resolve) => setTimeout(resolve, 80)); // Delay
      curr = curr.prev;
    }
  };

  const startSearchNode = async () => {
    if (startNode.length === 0 || endNode.length === 0 || isRunning === true)
      return;

    setMatrix(createMatrix());
    setIsRunning(true);

    const nodeArray: Node[] = [new Node(startNode[1], startNode[0], null)];
    const isVisited: Set<string> = new Set();

    isVisited.add(`${startNode[1]} ${startNode[0]}`);

    let isTargetNodeFound: boolean = false;

    const checkNodeTravelldedBlockedOOB = (node: Node) => {
      const a = node.y;
      const b = node.x;
      if (a < 0 || b < 0 || a === matrixWidth || b === matrixLength)
        return false;
      if (isVisited.has(`${b} ${a}`)) return false;
      //needs more work
      if (matrix[a][b] === 3) return false;
      if (matrix[a][b] === 2) {
        isTargetNodeFound = true;
      }
      return true;
    };

    await new Promise((resolve) => setTimeout(resolve, 400)); // Delay

    const BFSOperation = async () => {
      while (nodeArray.length > 0 && !isTargetNodeFound) {
        const currNode = nodeArray.shift();
        if (currNode) {
          const { x, y } = currNode;

          const nodeSides: Node[] = [
            new Node(x, y - 1, currNode),
            new Node(x + 1, y, currNode),
            new Node(x, y + 1, currNode),
            new Node(x - 1, y, currNode),
          ];
          for (const node of nodeSides) {
            if (checkNodeTravelldedBlockedOOB(node) && !isTargetNodeFound) {
              isVisited.add(`${node.x} ${node.y}`);
              nodeArray.push(node);
              setMatrix((prevMatrix) => {
                const newMatrix = [...prevMatrix];
                newMatrix[node.y][node.x] = 4;
                return newMatrix;
              });
              await new Promise((resolve) => setTimeout(resolve, 25)); // Delay
            }
            if (node.x === endNode[1] && node.y === endNode[0]) {
              await handleBacktracking(node);
            }
          }
        }
      }
      setIsRunning(false);
    };

    const DFSOperation = async () => {
      while (nodeArray.length > 0 && !isTargetNodeFound) {
        const currNode = nodeArray.shift();
        if (currNode) {
          const { x, y } = currNode;

          const nodeSides: Node[] = [
            new Node(x, y - 1, currNode),
            new Node(x + 1, y, currNode),
            new Node(x, y + 1, currNode),
            new Node(x - 1, y, currNode),
          ];
          for (const node of nodeSides) {
            if (checkNodeTravelldedBlockedOOB(node) && !isTargetNodeFound) {
              isVisited.add(`${node.x} ${node.y}`);
              nodeArray.push(node);
              setMatrix((prevMatrix) => {
                const newMatrix = [...prevMatrix];
                newMatrix[node.y][node.x] = 4;
                return newMatrix;
              });
              await new Promise((resolve) => setTimeout(resolve, 25)); // Delay
              break;
            }
            if (node.x === endNode[1] && node.y === endNode[0]) {
              await handleBacktracking(node);
            }
          }
        }
      }
      setIsRunning(false);
    };

    if (searchType === 0) {
      BFSOperation();
    } else if (searchType === 1) {
      DFSOperation();
    }
  };

  const createMatrix = () => {
    let matrixContent: number[][] = [];
    for (let i = 0; i < matrixWidth; i++) {
      const row: number[] = [];
      for (let j = 0; j < matrixLength; j++) {
        row.push(0);
      }
      matrixContent.push(row);
    }
    if (startNode.length && endNode.length) {
      matrixContent[startNode[0]][startNode[1]] = 1;
      matrixContent[endNode[0]][endNode[1]] = 2;
    }

    if (wallNodes.size) {
      wallNodes.forEach((item) => {
        const [y, x] = item.split(" ");
        matrixContent[Number(x)][Number(y)] = 3;
      });
    }
    return matrixContent;
  };

  const handleClear = () => {
    if (isRunning) {
      return;
    }
    setMatrix(createMatrix());
  };

  useEffect(() => {
    if (rendered) return;
    setRendered(true);
    setMatrix(createMatrix());
    // eslint-disable-next-line
  }, []);

  const scrollToElement = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth", // You can change this to 'auto' or 'instant' if needed
        block: "start", // Scroll to the top of the element
      });
    }
  };

  return (
    <div className="App">
      <header className="header">
        <h1>SEARCH ALGORITHM VIUALIZATION</h1>
      </header>
      <div className="main-content">
        <div
          id="grid"
          className="matrix-grid"
          style={{
            gridTemplateRows: `repeat(${matrixWidth}, 20px)`,
            gridTemplateColumns: `repeat(${matrixLength}, 20px)`,
          }}
        >
          {matrix.flat().map((element: number, index: number) => {
            return (
              <div
                key={index}
                className={`grid-item ${gridItemColorClass(element)}`}
                onMouseDown={
                  !isRunning && typeof element === "number"
                    ? () => {
                        handleGridItemClick(index);
                      }
                    : undefined
                }
              ></div>
            );
          })}
        </div>
        <div className="controls">
          <div className="legends">
            <h3 className="set-node--heading">Legend:</h3>
            <ul className="legend-list">
              <li className="legend-list-item">
                <div className="legend-origin legend-item"></div>
                <h4>origin</h4>
              </li>
              <li className="legend-list-item">
                <div className="legend-target legend-item"></div>
                <h4>target</h4>
              </li>
              <li className="legend-list-item">
                <div className="legend-blocked legend-item"></div>
                <h4>blocked</h4>
              </li>
              <li className="legend-list-item">
                <div className="legend-unvisited legend-item"></div>
                <h4>unvisited</h4>
              </li>
              <li className="legend-list-item">
                <div className="legend-visited legend-item"></div>
                <h4>visited</h4>
              </li>
              <li className="legend-list-item">
                <div className="legend-end-path legend-item"></div>
                <h4>found path</h4>
              </li>
            </ul>
          </div>
          <div className="set-search-type">
            <h3 className="set-node--heading">Search type</h3>
            <select
              onChange={(e) => setSearchType(Number(e.target.value))}
              className="set-search-type-selection"
            >
              <option value={0}>Breadth First Search</option>
              <option value={1}>Depth First Search</option>
            </select>
          </div>
          <div className="set-node--container">
            <h3 className="set-node--heading">Set node type:</h3>
            <div className="set-node">
              <div
                className={`node-type ${
                  selectedNodeType === 1 ? "selected" : null
                }`}
                onClick={() => setSelectedNodeType(1)}
              >
                origin
              </div>
              <div
                className={`node-type ${
                  selectedNodeType === 2 ? "selected" : null
                }`}
                onClick={() => setSelectedNodeType(2)}
              >
                target
              </div>
              <div
                className={`node-type ${
                  selectedNodeType === 3 ? "selected" : null
                }`}
                onClick={() => setSelectedNodeType(3)}
              >
                blocked
              </div>
              <div
                className={`node-type ${
                  selectedNodeType === 0 ? "selected" : null
                }`}
                onClick={() => setSelectedNodeType(0)}
              >
                unvisited
              </div>
            </div>
          </div>

          <button
            className="btn btn-start"
            onClick={() => {
              scrollToElement("grid");
              startSearchNode();
            }}
          >
            Start search
          </button>

          <button className="btn btn-clear" onClick={() => handleClear()}>
            Clear grid
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
