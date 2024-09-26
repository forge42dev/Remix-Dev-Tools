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
        "flex cursor-pointer items-center gap-1 rounded border border-[#1F9CF0] px-2.5 py-0.5 text-sm font-medium text-[#1F9CF0]"
      )}
    >
      Open in {name}
    </button>
  );
};

export { EditorButton };
