import clsx from "clsx";

interface EditorButtonProps {
  onClick: () => void;
  name: string;
}

const EditorButton = ({ name, onClick }: EditorButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "rdt-flex rdt-cursor-pointer rdt-items-center rdt-gap-1 rdt-rounded rdt-border rdt-border-[#1F9CF0] rdt-px-2.5 rdt-py-0.5 rdt-text-sm rdt-font-medium rdt-text-[#1F9CF0]"
      )}
    >
      Open in {name}
    </button>
  );
};

export { EditorButton };
