import { TopIcon } from "@/components/practice/TopIcon";
import styles from "./MenuButton.module.css";

export function MenuButton({ open, onOpen }: { open: boolean; onOpen: () => void }) {
  return (
    <button
      type="button"
      className={styles.pill}
      data-menu-button=""
      aria-haspopup="dialog"
      aria-expanded={open}
      title="Menu: pages, topics and looks. Ctrl K or Cmd K searches"
      onClick={onOpen}
    >
      <TopIcon name="menu" size={18} />
      <span>Menu</span>
    </button>
  );
}
