import { useEffect, useState, useRef } from "react";

function App() {
  const [matrix, setMatrix] = useState<(number | string)[][]>([]);
  // eslint-disable-next-line
  const [matrixWidth, setMatrixWidth] = useState<number>(45);
  // add 1 for offset
  // eslint-disable-next-line
  const [matrixLength, setMatrixLength] = useState<number>(60);
  // add 1 for offset
  const [selectedNodeType, setSelectedNodeType] = useState<number>(0);
  const [rendered, setRendered] = useState<boolean>(false);

  const [startNode, setStartNode] = useState<number[]>([]);
  const [endNode, setEndNode] = useState<number[]>([]);
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
      if (selectedNodeType === 1) setStartNode([a, b]);
      if (selectedNodeType === 2) setEndNode([a, b]);
      if (selectedNodeType === 3) {
        addRemoveWallNode(b, a);
      }
    }
    setMatrix(newMatrix);
  };

  // bfs and dfs visualizer

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

    while (curr.prev !== null) {
      if (curr.prev.prev === null) break;

      const { x, y } = curr.prev;
      // set color;

      setMatrix((prevMatrix) => {
        const newMatrix = [...prevMatrix];
        newMatrix[y][x] = 6;
        return newMatrix;
      });
      await new Promise((resolve) => setTimeout(resolve, 50)); // Delay
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
      if (a === 0 || b === 0 || a === matrixWidth || b === matrixLength)
        return false;
      if (isVisited.has(`${b} ${a}`)) return false;
      //needs more work
      if (matrix[a][b] === 3) return false;
      if (matrix[a][b] === 2) {
        isTargetNodeFound = true;
      }
      return true;
    };

    const mainOperation = async () => {
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
              await new Promise((resolve) => setTimeout(resolve, 5)); // Delay
            }
            if (node.x === endNode[1] && node.y === endNode[0]) {
              await handleBacktracking(node);
            }
          }
        }
      }
      setIsRunning(false);
    };
    mainOperation();
  };

  const createMatrix = () => {
    let matrixContent: (number | string)[][] = [];
    for (let i = 0; i < matrixWidth; i++) {
      const row: (number | string)[] = [];
      for (let j = 0; j < matrixLength; j++) {
        if (i === 0) {
          if (j === 0) row.push("‎ ");
          else row.push(j.toString());
        } else if (j === 0) row.push(i.toString());
        else row.push(0);
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

  // eslint-disable-next-line
  useEffect(() => {
    if (rendered) return;
    setRendered(true);
    setMatrix(createMatrix());
  }, []);

  return (
    <div className="App">
      <h1>Main</h1>
      {/* 20x20 grid */}
      <div
        className="matrix-grid"
        style={{
          gridTemplateRows: `repeat(${matrixWidth}, 30px)`,
          gridTemplateColumns: `repeat(${matrixLength}, 30px)`,
        }}
      >
        {matrix.flat().map((element: number | string, index: number) => {
          return (
            <div
              key={index}
              className={
                typeof element === "number"
                  ? `grid-item ${gridItemColorClass(element)}`
                  : "grid-label"
              }
              onMouseDown={
                !isRunning && typeof element === "number"
                  ? () => {
                      handleGridItemClick(index);
                    }
                  : undefined
              }
            >
              {typeof element === "string" ? element : null}
            </div>
          );
        })}
      </div>
      <select
        name="Set Node Type"
        className="selection"
        onChange={(e) => {
          setSelectedNodeType(Number(e.target.value));
        }}
      >
        <option value={0}>Open</option>
        <option value={1}>Start</option>
        <option value={2}>End</option>
        <option value={3}>Blocked</option>
      </select>

      <button onClick={() => startSearchNode()}>Start search</button>
      <button onClick={() => handleClear()}>Clear Grid</button>
    </div>
  );
}

export default App;
