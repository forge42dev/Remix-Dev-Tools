import { Columns, MonitorPlay, Send, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useGetSocket } from "../hooks/useGetSocket";

export interface TerminalInput {
  type: "command" | "output";
  data: string;
}

interface TerminalProps {
  onClose: () => void;
}

const Terminal = ({ onClose }: TerminalProps) => {
  const [terminalOutput, setTerminalOutput] = useState<TerminalInput[]>([]); // [{type: "log", data: "hello world"}
  const [command, setCommand] = useState("");

  const onSubmit = () => {
    sendJsonMessage({
      type: "terminal_command",
      command,
    });
    setTerminalOutput([
      ...terminalOutput,
      {
        type: "command",
        data: command + "\n",
      },
    ]);
    setCommand("");
  };
  const { lastJsonMessage, sendJsonMessage } = useGetSocket();

  useEffect(() => {
    if (lastJsonMessage?.type === "terminal_command") {
      setTerminalOutput([
        ...terminalOutput,
        {
          type: "output",
          data: lastJsonMessage.data + "\n",
        },
      ]);
    }
  }, [lastJsonMessage, terminalOutput]);

  return (
    <div className="h-full w-full flex border-gray-100/10 border rounded-lg relative flex-col justify-between">
      <button
        onClick={onClose}
        title="Close terminal"
        className="absolute right-2 top-2"
      >
        <X className="stroke-red-500" size={24} />
      </button>
      <div className="h-72 overflow-y-auto p-2">
        {terminalOutput?.map((output) => (
          <div
            className={output.type === "command" ? "font-bold" : ""}
            dangerouslySetInnerHTML={{
              __html: output.data.split("\n").join("<br />"),
            }}
          ></div>
        ))}
      </div>

      <div className="relative flex border-3 border-gray-100 rounded-xl">
        <input
          onKeyDown={(e) => {
            if (e.key === "Enter") onSubmit();
          }}
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onBlur={() => setCommand(command.trim())}
          placeholder="Enter command"
          className="w-full font-medium rounded-tr-none z-10 py-0 rounded-tl-none text-gray-500 text-lg h-8 rounded-lg border-none px-6"
        />
        <button
          onClick={onSubmit}
          className="z-20 rounded-l-none rounded-tr-none cursor-pointer right-0 top-0 absolute border-none w-8 flex items-center justify-center h-8 rounded-lg bg-green-500"
        >
          <Send className="stroke-white" size={16} />
        </button>
      </div>
    </div>
  );
};

const TerminalTab = () => {
  const [terminals, setTerminals] = useState<number[]>([0]);
  const [, setProjectCommands] = useState<string[]>([]);
  const { lastJsonMessage, sendJsonMessage } = useGetSocket();

  useEffect(() => {
    sendJsonMessage({ type: "commands" });
  }, [sendJsonMessage]);

  useEffect(() => {
    if (lastJsonMessage?.type === "commands") {
      setProjectCommands(lastJsonMessage?.data as any);
    }
  }, [lastJsonMessage]);

  return (
    <div className="rounded-lg gap-4 relative h-full flex justify-between ">
      <button
        className="absolute -right-8"
        onClick={() => setTerminals([...terminals, terminals.length])}
      >
        <Columns />
      </button>
      <button
        className="absolute -right-8 top-8"
        onClick={() => setTerminals([...terminals, terminals.length])}
      >
        <MonitorPlay />
      </button>
      {terminals.map((terminal) => (
        <Terminal
          onClose={() => {
            setTerminals(terminals.filter((t) => t !== terminal));
          }}
          key={terminal}
        />
      ))}
    </div>
  );
};

export { TerminalTab };
