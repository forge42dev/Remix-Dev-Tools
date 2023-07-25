import { Columns, /* MonitorPlay */ Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useGetSocket } from "../hooks/useGetSocket";
import { useRDTContext } from "../context/useRDTContext";
import { Terminal } from "../context/terminal";
import clsx from "clsx";
import { useTerminalShortcuts } from "../hooks/useTerminalShortcuts";

interface TerminalProps {
  onClose: () => void;
  terminal: Terminal;
  projectCommands?: Record<string, string>;
}

const Terminal = ({ onClose, terminal, projectCommands }: TerminalProps) => {
  const {
    addTerminalOutput,
    toggleTerminalLock,
    setProcessId,
    addTerminalHistory,
    terminals,
  } = useRDTContext();
  const [command, setCommand] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const onSubmit = () => {
    sendJsonMessage({
      type: "terminal_command",
      command,
      terminalId: terminal.id,
    });
    addTerminalOutput(terminal.id, {
      type: "command",
      value: command + "\n",
    });
    addTerminalHistory(terminal.id, command);
    setCommand("");
    toggleTerminalLock(terminal.id);
  };

  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight });
  }, [terminal.output]);

  const { sendJsonMessage } = useGetSocket({
    onMessage: (message) => {
      try {
        const data = JSON.parse(message.data);
        // Check if command was sent from this terminal
        const isThisTerminalCommand =
          data.type === "terminal_command" && data.terminalId === terminal.id;

        if (isThisTerminalCommand) {
          const processDone =
            data.subtype === "ERROR" ||
            data.subtype === "EXIT" ||
            data.subtype === "CLOSE";
          const hasOutputData =
            data.subtype === "DATA" || data.subtype === "ERROR";
          // set the process ID if it exists so we can terminate it if we want
          if (data.processId) {
            setProcessId(terminal.id, data.processId);
          }
          // Process done => unlock terminal
          if (processDone) {
            setProcessId(terminal.id, undefined);
            toggleTerminalLock(terminal.id, false);
          }
          // Add output to terminal
          if (hasOutputData) {
            addTerminalOutput(data.terminalId, {
              type: data.subtype === "ERROR" ? "error" : "output",
              value: data.data,
            });
          }
        }
      } catch (e) {
        // console.log(e);
      }
    },
  });
  const { onKeyDown } = useTerminalShortcuts({
    onSubmit,
    setCommand,
    terminal,
    projectCommands,
    sendJsonMessage,
  });
  return (
    <div className="rdt-relative rdt-flex rdt-h-full rdt-w-full rdt-flex-col rdt-justify-between rdt-rounded-lg rdt-border rdt-border-gray-100/10">
      {terminals.length > 1 && (
        <button
          onClick={onClose}
          title="Close terminal"
          className="rdt-absolute rdt-right-2 rdt-top-2"
        >
          <X className="rdt-stroke-red-500" size={24} />
        </button>
      )}
      <div ref={ref} className="rdt-overflow-y-auto rdt-p-2">
        {terminal.output?.map((output, i) => (
          <div
            key={output.value + i}
            className={clsx(
              "rdt-px-2",
              output.type === "command" &&
                "rdt-mb-1 rdt-mt-1 rdt-block rdt-rounded-lg rdt-bg-blue-950 rdt-px-2 rdt-py-1 rdt-font-bold",
              output.type === "error" && "rdt-text-red-500 "
            )}
            dangerouslySetInnerHTML={{
              __html: output.value.split("\n").join("<br />"),
            }}
          ></div>
        ))}
      </div>

      <div className="rdt-border-3 rdt-relative rdt-flex rdt-rounded-xl rdt-border-gray-100">
        <input
          readOnly={terminal.locked}
          onKeyDown={onKeyDown}
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onBlur={() => setCommand(command?.trim())}
          placeholder={terminal.locked ? "Command running" : "Enter command"}
          className={clsx(
            "rdt-z-10 rdt-h-8 rdt-w-full rdt-rounded-lg rdt-rounded-tl-none rdt-rounded-tr-none rdt-border-none rdt-px-6 rdt-py-0 rdt-text-lg rdt-font-medium rdt-text-gray-500",
            terminal.locked && "rdt-opacity-50"
          )}
        />
        <button
          disabled={terminal.locked}
          onClick={onSubmit}
          className={clsx(
            "rdt-absolute rdt-right-0 rdt-top-0 rdt-z-20 rdt-flex rdt-h-8 rdt-w-8 rdt-cursor-pointer rdt-items-center rdt-justify-center rdt-rounded-lg rdt-rounded-l-none rdt-rounded-tr-none rdt-border-none rdt-bg-green-500",
            terminal.locked && "rdt-opacity-50"
          )}
        >
          <Send className="rdt-stroke-white" size={16} />
        </button>
      </div>
    </div>
  );
};

const TerminalTab = () => {
  const { terminals, addOrRemoveTerminal } = useRDTContext();

  const [projectCommands, setProjectCommands] =
    useState<Record<string, string>>();
  const { sendJsonMessage } = useGetSocket({
    onOpen: () => {
      sendJsonMessage({ type: "commands" });
    },
    onMessage: (message) => {
      try {
        const data = JSON.parse(message.data);
        if (data.type === "commands") {
          setProjectCommands(data.data);
        }
      } catch (e) {
        // console.log(e);
      }
    },
  });

  return (
    <div className="rdt-relative rdt-mr-8 rdt-flex rdt-h-full rdt-justify-between rdt-gap-4 rdt-rounded-lg">
      {terminals.length < 3 && (
        <button
          className="rdt-absolute -rdt-right-8"
          onClick={() => addOrRemoveTerminal()}
        >
          <Columns />
        </button>
      )}
      {/*  <button className="rdt-absolute -rdt-right-8 rdt-top-8">
        <MonitorPlay />
      </button> */}
      {terminals.map((terminal) => (
        <Terminal
          terminal={terminal}
          projectCommands={projectCommands}
          onClose={() => addOrRemoveTerminal(terminal.id)}
          key={terminal.id}
        />
      ))}
    </div>
  );
};

export { TerminalTab };
