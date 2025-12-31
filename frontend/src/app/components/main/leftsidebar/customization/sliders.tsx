'use client'

import { useState, useEffect } from 'react';
import { updateCustom } from '../../api/selfUpdates.js'
type Setter = React.Dispatch<React.SetStateAction<string>>


const SELECTION = [
  "text", "border", "side", "button", "hover",
  "header", "chat", "time", "foot", "input", "send"
] as const;

type ThemeKey = typeof SELECTION[number];
type Theme = Record<ThemeKey, string>;

const DARK_THEME: Theme = {
  text: "#fefeff",
  border: "#222223",
  side: "#232428",
  button: "#232428",
  hover: "#b9bbbe",
  header: "#23272a",
  chat: "#313338",
  time: "#b9bbbe",
  foot: "#383a40",
  input: "#202225",
  send: "#5865f2",
};

export function SliderBar({ setSidebar, custom, customTheme }: { setSidebar: Setter, custom: string, customTheme: Theme }) {

  const [theme, setTheme] = useState<Theme>(customTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const newBuild = () => {
    updateCustom(custom, theme);
    updateCustom("Last", theme);
  }

  return (
    <div className="sidebar">
      <div className="top">
        <span className="text big">Customization</span>
      </div>

      <div className="tabs">
        <div className="colorSelection">
          {SELECTION.map((key) => (
            <ColorOption
              key={key}
              name={key}
              value={theme[key]}
              onChange={(val) =>
                setTheme(prev => ({ ...prev, [key]: val }))
              }
            />
          ))}
        </div>
      </div>

      <div className="bottom">
        <MenuButton
          label="Save"
          onClick={newBuild}
        />

        <MenuButton
          label="Exit Custom"
          onClick={() => setSidebar("options")}
        />
      </div>
    </div>
  );
}

function ColorOption({
  name,
  value,
  onChange,
}: {
  name: ThemeKey;
  value: string;
  onChange: (val: string) => void;
}) {
  const title = name[0].toUpperCase() + name.slice(1);

  return (
    <div className="colorSelect">
      <span className="text color-select-text">{title}</span>

      <input
        type="text"
        className="color-select-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      <input
        type="color"
        className="cursor-pointer"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function applyTheme(theme: Theme) {
  Object.entries(theme).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--${key}`, value);
  });
}

function MenuButton({
  label,
  onClick,
  className = "",
}: {
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      className={`button menu-button ${className}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}


