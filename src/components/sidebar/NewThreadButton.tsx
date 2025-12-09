import { Button } from '../ui/Button';

interface NewThreadButtonProps {
  onClick: () => void;
}

export function NewThreadButton({ onClick }: NewThreadButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2"
      variant="primary"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path d="M12 4v16m8-8H4"></path>
      </svg>
      New Thread
    </Button>
  );
}
