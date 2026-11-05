import { useState } from "react";

export function FilePick({ onPick }: { onPick: (file: File | undefined) => void }) {
  const [name, setName] = useState("");

  return (
    <label className="file-pick">
      <input
        type="file"
        accept="image/*"
        aria-label="Tải ảnh sản phẩm"
        onChange={(event) => {
          const file = event.target.files?.[0];
          setName(file?.name ?? "");
          onPick(file);
          event.target.value = "";
        }}
      />
      <span>Chọn ảnh</span>
      {name ? <em>{name}</em> : null}
    </label>
  );
}
