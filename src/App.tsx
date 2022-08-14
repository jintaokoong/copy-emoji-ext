import { emoji } from "node-emoji";
import { filter, invertObj, pipe, replace, toPairs } from "ramda";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { atom, useAtomValue, useSetAtom } from "jotai";
import copy from "copy-to-clipboard";

const searchAtom = atom("");

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const setDebounced = useSetAtom(searchAtom);
  const timeout = useRef<number | null>(null);

  useEffect(() => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }

    timeout.current = setTimeout(() => {
      setDebounced(searchTerm);
      timeout.current && clearTimeout(timeout.current);
    }, 500);

    return () => {
      timeout.current && clearTimeout(timeout.current);
    };
  }, [searchTerm, setDebounced]);

  return (
    <input
      style={{
        border: "1px solid #ccc",
        borderRadius: "4px",
        padding: "8px",
        marginBottom: "5px",
      }}
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.currentTarget.value)}
    />
  );
};

function App() {
  const debounced = useAtomValue(searchAtom);
  const listing = useMemo(() => {
    return pipe(invertObj, toPairs)(emoji) as [string, string][];
  }, [emoji]);
  const filtered = useMemo(() => {
    return filter(
      ([, desc]) => desc.toLowerCase().includes(debounced.toLowerCase()),
      listing
    );
  }, [debounced, listing]);

  const executeCopy = useCallback(
    (emoji: string) => () => {
      copy(emoji);
      window.close();
    },
    []
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 5,
        fontSize: "1.15rem",
      }}
    >
      <Search />
      {filtered.map(([key, value]) => (
        <div
          key={key}
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 10,
            cursor: "pointer",
          }}
          onClick={executeCopy(key)}
        >
          <div>{key}</div>
          <div
            style={{
              width: 250,
              fontSize: "1rem",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {replace(/-|_/g, " ", value)}
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;
