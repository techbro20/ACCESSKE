import { colors } from '../../theme/colors';

interface Props {
  label: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
}

export default function Button({ label, onClick, type = 'button' }: Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        background: colors.red,
        color: colors.beige,
        padding: '10px 20px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 600
      }}
    >
      {label}
    </button>
  );
}
