import { parseGraphInputEdges } from "./parseGraphInput";
import { parseGraphInputParentChild } from "./parseGraphInput";
import { useEffect, useState } from "react";
import { InputFormat, ParsedGraph } from "../types";
import { Graph } from "../types";

interface Props {
  graphEdges: Graph;
  setGraphEdges: React.Dispatch<React.SetStateAction<Graph>>;
  graphParChild: Graph;
  setGraphParChild: React.Dispatch<React.SetStateAction<Graph>>;
  inputFormat: InputFormat;
  setInputFormat: React.Dispatch<React.SetStateAction<InputFormat>>;
  directed: boolean;
  setDirected: React.Dispatch<React.SetStateAction<boolean>>;
}

export function GraphInput({
  graphEdges,
  setGraphEdges,
  graphParChild,
  setGraphParChild,
  inputFormat,
  setInputFormat,
  directed,
  setDirected,
}: Props) {
  const [inputStatus, setInputStatus] = useState<boolean>(true);

  const processGraphInput = () => {
    let parsedGraph: ParsedGraph;

    let roots = "";

    if (!directed) {
      roots =
        inputFormat === "edges"
          ? (
              document.getElementById(
                "graphInputRootsEdges",
              ) as HTMLTextAreaElement
            ).value
          : (
              document.getElementById(
                "graphInputRootsParChild",
              ) as HTMLTextAreaElement
            ).value;
    }

    if (inputFormat === "edges") {
      parsedGraph = parseGraphInputEdges(
        roots,
        (document.getElementById("graphInputEdges") as HTMLTextAreaElement)
          .value,
        (document.getElementById("graphInputNodeLabels") as HTMLTextAreaElement)
          .value,
      );
      if (parsedGraph.status === "BAD") {
        setInputStatus(false);
      } else {
        setInputStatus(true);
        setGraphEdges(parsedGraph.graph!);
      }
    } else {
      parsedGraph = parseGraphInputParentChild(
        roots,
        (document.getElementById("graphInputParent") as HTMLTextAreaElement)
          .value,
        (document.getElementById("graphInputChild") as HTMLTextAreaElement)
          .value,
        (document.getElementById("graphInputEdgeLabels") as HTMLTextAreaElement)
          .value,
        (document.getElementById("graphInputNodeLabels") as HTMLTextAreaElement)
          .value,
      );
      if (parsedGraph.status === "BAD") {
        setInputStatus(false);
      } else {
        setInputStatus(true);
        setGraphParChild(parsedGraph.graph!);
      }
    }
  };

  const processNodeLabels = () => {
    const currentNodes = (
      document.getElementById("graphInputCurrentNodes") as HTMLTextAreaElement
    ).value
      .trim()
      .split(/\s+/)
      .filter((u) => u.length);

    const nodeLabels = (
      document.getElementById("graphInputNodeLabels") as HTMLTextAreaElement
    ).value
      .trim()
      .split(/\s+/)
      .filter((u) => u.length);

    const len = Math.min(currentNodes.length, nodeLabels.length);

    let mp = new Map<string, string>();

    for (let i = 0; i < len; i++) {
      if (nodeLabels[i] !== "_") {
        mp.set(currentNodes[i], nodeLabels[i]);
      }
    }

    if (inputFormat === "edges") {
      setGraphEdges({ ...graphEdges, nodeLabels: mp });
    } else {
      setGraphParChild({ ...graphParChild, nodeLabels: mp });
    }
  };

  const handleTextAreaKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (e.key === "Escape") {
      e.currentTarget.blur();
    }
  };

  useEffect(() => {
    processGraphInput();
    window.addEventListener("resize", processGraphInput);
    return () => {
      window.removeEventListener("resize", processGraphInput);
    };
  }, []);

  useEffect(() => {
    processGraphInput();
  }, [inputFormat]);

  return (
    <>
      <div
        className="font-jetbrains flex flex-col border-2 rounded-lg bg-block
          shadow-shadow shadow border-border sm:ml-1/16 sm:mt-1/8 sm:mr-1/16
          lg:m-0 lg:absolute lg:top-1/2 lg:-translate-y-1/2 lg:w-1/4
          hover:border-border-hover lg:left-1/24 xl:left-5/200 xl:w-1/5 p-3
          space-y-3 z-10"
      >
        <h3 className="font-bold text-lg">图论画图工具</h3>

        <br />

        <h4 className="text-base font-semibold">当前节点</h4>
        <textarea
          wrap="off"
          rows={1}
          name="graphInputCurrentNodes"
          id="graphInputCurrentNodes"
          onChange={processNodeLabels}
          value={
            inputFormat === "edges"
              ? [...graphEdges.nodes].sort().join(" ")
              : [...graphParChild.nodes].sort().join(" ")
          }
          readOnly
          className="bg-ovr font-semibold font-jetbrains resize-none border-2
            rounded-md px-2 py-1 border-single focus:outline-none text-lg
            text-current-nodes border-border w-auto"
        ></textarea>

        <h4 className="text-base font-semibold">节点标签</h4>
        <textarea
          wrap="off"
          name="graphInputNodeLabels"
          id="graphInputNodeLabels"
          rows={1}
          onChange={processNodeLabels}
          onKeyDown={handleTextAreaKeyDown}
          placeholder="TIP: '_' -> empty label"
          className="bg-ovr font-semibold font-jetbrains resize-none border-2
            rounded-md px-2 py-1 border-single focus:outline-none text-lg
            border-border focus:border-border-active placeholder-placeholder
            placeholder:italic w-auto overflow-hidden"
        ></textarea>

        <br />

        <div className="flex font-light text-sm justify-between">
          <span>
            <span>
              {inputFormat === "edges" ? (
                <span className="text-selected p-0 hover:cursor-pointer">
                  边表示法
                </span>
              ) : (
                <span
                  className="p-0 hover:cursor-pointer"
                  onClick={() => {
                    setInputFormat("edges");
                    let checkbox = document.getElementById(
                      "inputFormatCheckbox",
                    ) as HTMLInputElement;
                    checkbox.checked = false;
                  }}
                >
                  边表示法
                </span>
              )}
            </span>
            <span> | </span>
            <span>
              {inputFormat === "parentChild" ? (
                <span className="text-selected p-0 hover:cursor-pointer">
                  父节点表示法
                </span>
              ) : (
                <span
                  className="p-0 hover:cursor-pointer"
                  onClick={() => {
                    setInputFormat("parentChild");
                    let checkbox = document.getElementById(
                      "inputFormatCheckbox",
                    ) as HTMLInputElement;
                    checkbox.checked = true;
                  }}
                >
                  父节点表示法
                </span>
              )}
            </span>
          </span>
          <label className="relative inline w-9">
            <input
              onClick={() =>
                setInputFormat(
                  inputFormat === "edges" ? "parentChild" : "edges",
                )
              }
              type="checkbox"
              id="inputFormatCheckbox"
              className="peer invisible"
            />
            <span
              className="absolute top-0 left-0 w-9 h-5 cursor-pointer
                rounded-full bg-toggle-uncheck border-none transition-all
                duration-75 hover:bg-toggle-hover peer-checked:bg-toggle-check"
            ></span>
            <span
              className="absolute top-0.5 left-0.5 w-4 h-4 bg-toggle-circle
                rounded-full transition-all duration-75 cursor-pointer
                peer-checked:translate-x-4"
            ></span>
          </label>
        </div>

        <div className="flex font-light text-sm justify-between">
          <span>
            <span>
              {!directed ? (
                <span className="text-selected p-0 hover:cursor-pointer">
                  无向图
                </span>
              ) : (
                <span
                  className="p-0 hover:cursor-pointer"
                  onClick={() => {
                    setDirected(false);
                    let checkbox = document.getElementById(
                      "directedCheckbox",
                    ) as HTMLInputElement;
                    checkbox.checked = false;
                  }}
                >
                  无向图
                </span>
              )}
            </span>
            <span> | </span>
            <span>
              {directed ? (
                <span className="text-selected p-0 hover:cursor-pointer">
                  有向图
                </span>
              ) : (
                <span
                  className="p-0 hover:cursor-pointer"
                  onClick={() => {
                    setDirected(true);
                    let checkbox = document.getElementById(
                      "directedCheckbox",
                    ) as HTMLInputElement;
                    checkbox.checked = true;
                  }}
                >
                  有向图
                </span>
              )}
            </span>
          </span>
          <label className="relative inline w-9">
            <input
              onClick={() => setDirected(!directed)}
              type="checkbox"
              id="directedCheckbox"
              className="peer invisible"
            />
            <span
              className="absolute top-0 left-0 w-9 h-5 cursor-pointer
                rounded-full bg-toggle-uncheck border-none transition-all
                duration-75 hover:bg-toggle-hover peer-checked:bg-toggle-check"
            ></span>
            <span
              className="absolute top-0.5 left-0.5 w-4 h-4 bg-toggle-circle
                rounded-full transition-all duration-75 cursor-pointer
                peer-checked:translate-x-4"
            ></span>
          </label>
        </div>

        <br />

        <h4
          className={
            !directed && inputFormat === "edges"
              ? "text-base font-semibold"
              : "hidden"
          }
        >
          根节点
        </h4>
        <textarea
          wrap="off"
          name="graphInputRootsEdges"
          id="graphInputRootsEdges"
          rows={1}
          onChange={processGraphInput}
          onKeyDown={handleTextAreaKeyDown}
          className={
            !directed && inputFormat === "edges"
              ? `bg-ovr font-semibold font-jetbrains resize-none border-2
                rounded-md px-2 py-1 border-single focus:outline-none text-lg
                border-border focus:border-border-active w-auto overflow-hidden`
              : "hidden"
          }
        ></textarea>

        <h4
          className={
            !directed && inputFormat === "parentChild"
              ? "text-base font-semibold"
              : "hidden"
          }
        >
          根
        </h4>
        <textarea
          wrap="off"
          name="graphInputRootsParChild"
          id="graphInputRootsParChild"
          rows={1}
          onChange={processGraphInput}
          onKeyDown={handleTextAreaKeyDown}
          className={
            !directed && inputFormat === "parentChild"
              ? `bg-ovr font-semibold font-jetbrains resize-none border-2
                rounded-md px-2 py-1 border-single focus:outline-none text-lg
                border-border focus:border-border-active w-auto overflow-hidden`
              : "hidden"
          }
        ></textarea>

        <h4
          className={
            inputFormat === "edges" ? "text-base font-semibold" : "hidden"
          }
        >
          边
        </h4>
        <textarea
          wrap="off"
          name="graphInputEdges"
          id="graphInputEdges"
          onChange={processGraphInput}
          onKeyDown={handleTextAreaKeyDown}
          rows={8}
          className={
            inputFormat === "edges"
              ? `font-semibold font-jetbrains resize-none border-2 rounded-md
                px-2 py-1 border-single focus:outline-none text-lg border-border
                focus:border-border-active bg-ovr w-auto overflow-hidden`
              : "hidden"
          }
        ></textarea>

        <h4
          className={
            inputFormat === "parentChild" ? "text-base font-semibold" : "hidden"
          }
        >
          父节点
        </h4>
        <textarea
          wrap="off"
          name="graphInputParent"
          id="graphInputParent"
          rows={1}
          onChange={processGraphInput}
          onKeyDown={handleTextAreaKeyDown}
          className={
            inputFormat === "parentChild"
              ? `bg-ovr font-semibold font-jetbrains resize-none border-2
                rounded-md px-2 py-1 border-single focus:outline-none text-lg
                border-border focus:border-border-active w-auto overflow-hidden`
              : "hidden"
          }
        ></textarea>

        <h4
          className={
            inputFormat === "parentChild" ? "text-base font-semibold" : "hidden"
          }
        >
          子节点
        </h4>
        <textarea
          wrap="off"
          name="graphInputChild"
          id="graphInputChild"
          rows={1}
          defaultValue={"1 2 3 4 5 6 7 8 9"}
          onChange={processGraphInput}
          onKeyDown={handleTextAreaKeyDown}
          className={
            inputFormat === "parentChild"
              ? `bg-ovr font-semibold font-jetbrains resize-none border-2
                rounded-md px-2 py-1 border-single focus:outline-none text-lg
                border-border focus:border-border-active w-auto overflow-hidden`
              : "hidden"
          }
        ></textarea>

        <h4
          className={
            inputFormat === "parentChild" ? "text-base font-semibold" : "hidden"
          }
        >
          边标签
        </h4>
        <textarea
          wrap="off"
          name="graphInputEdgeLabels"
          id="graphInputEdgeLabels"
          rows={1}
          onChange={processGraphInput}
          onKeyDown={handleTextAreaKeyDown}
          className={
            inputFormat === "parentChild"
              ? `bg-ovr font-semibold font-jetbrains resize-none border-2
                rounded-md px-2 py-1 border-single focus:outline-none text-lg
                border-border focus:border-border-active w-auto overflow-hidden`
              : "hidden"
          }
        ></textarea>

        <div className="flex justify-between">
          <button
            className="bg-clear-normal hover:bg-clear-hover
              active:bg-clear-active inline rounded-md px-2 py-1"
            onClick={() => {
              if (inputFormat === "edges") {
                (
                  document.getElementById(
                    "graphInputEdges",
                  ) as HTMLTextAreaElement
                ).value = "";
              } else {
                (
                  document.getElementById(
                    "graphInputParent",
                  ) as HTMLTextAreaElement
                ).value = "";
              }
              processGraphInput();
            }}
          >
            Clear
          </button>
          {inputStatus ? (
            <span
              className="font-jetbrains bg-format-ok rounded-md text-right px-2
                py-1 inline"
            >
              Format: OK
            </span>
          ) : (
            <span
              className="font-jetbrains bg-format-bad rounded-md text-right px-2
                py-1 inline"
            >
              Format: BAD
            </span>
          )}
        </div>
      </div>
    </>
  );
}
