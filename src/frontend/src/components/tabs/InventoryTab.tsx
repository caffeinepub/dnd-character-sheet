import { useCallback, useEffect, useState } from "react";
import type { Character, DndBackend, InventoryItem } from "../../types";

interface Props {
  actor: DndBackend;
  character: Character;
  characterId: bigint;
  onUpdate: () => void;
}

type ItemWithId = { id: bigint } & InventoryItem;
const EMPTY_ITEM = {
  name: "",
  quantity: 1,
  weight: "",
  description: "",
  equipped: false,
};

export default function InventoryTab({
  actor,
  character,
  characterId,
  onUpdate,
}: Props) {
  const [items, setItems] = useState<ItemWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ItemWithId | null>(null);
  const [form, setForm] = useState({ ...EMPTY_ITEM });
  const [saving, setSaving] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState(false);

  const cp = Number(character.gold) % 10;
  const sp = Math.floor(Number(character.gold) / 10) % 10;
  const ep = Math.floor(Number(character.gold) / 100) % 5;
  const gp = Math.floor(Number(character.gold) / 500) % 20;
  const pp = Math.floor(Number(character.gold) / 10000);
  const [currency, setCurrency] = useState({ cp, sp, ep, gp, pp });

  const load = useCallback(async () => {
    setLoading(true);
    const result = (await actor.getItemsByCharacter(
      characterId,
    )) as unknown as [bigint, InventoryItem][];
    setItems(result.map(([id, item]) => ({ id, ...item })));
    setLoading(false);
  }, [actor, characterId]);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY_ITEM });
    setShowForm(true);
  };
  const openEdit = (item: ItemWithId) => {
    setEditing(item);
    setForm({
      name: item.name,
      quantity: Number(item.quantity),
      weight: item.weight,
      description: item.description,
      equipped: item.equipped,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const item: InventoryItem = {
      characterId,
      name: form.name,
      quantity: BigInt(form.quantity),
      weight: form.weight,
      description: form.description,
      equipped: form.equipped,
    };
    if (editing) await actor.updateItem(editing.id, item);
    else await actor.addItem(item);
    await load();
    setShowForm(false);
    setSaving(false);
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm("Remove this item?")) return;
    await actor.deleteItem(id);
    await load();
  };

  const toggleEquipped = async (item: ItemWithId) => {
    await actor.updateItem(item.id, { ...item, equipped: !item.equipped });
    await load();
  };

  const saveCurrency = async () => {
    const totalCp =
      currency.cp +
      currency.sp * 10 +
      currency.ep * 100 +
      currency.gp * 500 +
      currency.pp * 10000;
    await actor.updateCharacter(characterId, {
      ...character,
      gold: BigInt(totalCp),
    });
    await onUpdate();
    setEditingCurrency(false);
  };

  const f = (field: string, val: string | number | boolean) =>
    setForm((prev) => ({ ...prev, [field]: val }));

  return (
    <div>
      {/* Currency */}
      <div className="ds-card" style={{ padding: 16, marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <h3
            className="font-cinzel"
            style={{ color: "var(--ds-gold)", fontSize: 14 }}
          >
            CURRENCY
          </h3>
          {!editingCurrency ? (
            <button
              type="button"
              className="ds-btn-ghost"
              style={{ fontSize: 12, padding: "4px 8px" }}
              onClick={() => setEditingCurrency(true)}
            >
              Edit
            </button>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                className="ds-btn-primary"
                onClick={saveCurrency}
                style={{ fontSize: 12, padding: "4px 10px" }}
              >
                Save
              </button>
              <button
                type="button"
                className="ds-btn-ghost"
                onClick={() => setEditingCurrency(false)}
                style={{ fontSize: 12 }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {(["pp", "gp", "ep", "sp", "cp"] as const).map((coin) => (
            <div key={coin} style={{ textAlign: "center" }}>
              <div
                style={{
                  color: "var(--ds-muted)",
                  fontSize: 11,
                  marginBottom: 4,
                  textTransform: "uppercase",
                }}
              >
                {coin}
              </div>
              {editingCurrency ? (
                <input
                  type="number"
                  min={0}
                  value={currency[coin]}
                  onChange={(e) =>
                    setCurrency((prev) => ({
                      ...prev,
                      [coin]: Number.parseInt(e.target.value) || 0,
                    }))
                  }
                  style={{
                    width: 56,
                    textAlign: "center",
                    backgroundColor: "var(--ds-surface2)",
                    border: "1px solid var(--ds-gold)",
                    color: "var(--ds-text)",
                    borderRadius: 4,
                    padding: "4px 0",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 56,
                    height: 36,
                    backgroundColor: "var(--ds-surface2)",
                    border: "1px solid var(--ds-border)",
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--ds-gold)",
                    fontSize: 16,
                    fontWeight: 700,
                  }}
                >
                  {currency[coin]}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h3
          className="font-cinzel"
          style={{ color: "var(--ds-gold)", fontSize: 16 }}
        >
          EQUIPMENT ({items.length})
        </h3>
        <button
          type="button"
          className="ds-btn-primary"
          onClick={openNew}
          style={{ fontFamily: "Cinzel, serif", fontSize: 13 }}
        >
          + Add Item
        </button>
      </div>

      {loading ? (
        <p style={{ color: "var(--ds-muted)" }}>Loading items...</p>
      ) : items.length === 0 ? (
        <p
          style={{
            color: "var(--ds-muted)",
            textAlign: "center",
            marginTop: 32,
          }}
        >
          No items. Add equipment to your inventory!
        </p>
      ) : (
        items.map((item) => (
          <div
            key={item.id.toString()}
            className="ds-card2"
            style={{
              padding: 12,
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <button
              type="button"
              onClick={() => toggleEquipped(item)}
              title={item.equipped ? "Equipped" : "Not equipped"}
              style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                border: "2px solid var(--ds-gold)",
                backgroundColor: item.equipped
                  ? "var(--ds-gold)"
                  : "transparent",
                cursor: "pointer",
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <span style={{ color: "var(--ds-text)", fontWeight: 600 }}>
                  {item.name}
                </span>
                {item.equipped && (
                  <span
                    style={{
                      color: "var(--ds-gold)",
                      fontSize: 11,
                      backgroundColor: "rgba(201,163,90,0.1)",
                      padding: "1px 6px",
                      borderRadius: 10,
                    }}
                  >
                    Equipped
                  </span>
                )}
                {item.quantity > 1n && (
                  <span style={{ color: "var(--ds-muted)", fontSize: 12 }}>
                    x{item.quantity.toString()}
                  </span>
                )}
                {item.weight && (
                  <span style={{ color: "var(--ds-muted)", fontSize: 12 }}>
                    {item.weight}
                  </span>
                )}
              </div>
              {item.description && (
                <p
                  style={{
                    color: "var(--ds-muted)",
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  {item.description}
                </p>
              )}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                className="ds-btn-ghost"
                style={{ fontSize: 12, padding: "4px 8px" }}
                onClick={() => openEdit(item)}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#666",
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                🗑️
              </button>
            </div>
          </div>
        ))
      )}

      {showForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            className="ds-card"
            style={{ width: "100%", maxWidth: 480, padding: 24 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h2
                className="font-cinzel"
                style={{ color: "var(--ds-gold)", fontSize: 18 }}
              >
                {editing ? "Edit Item" : "Add Item"}
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--ds-muted)",
                  cursor: "pointer",
                  fontSize: 20,
                }}
              >
                ×
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <label
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <span className="ds-label">Item Name *</span>
                <input
                  className="ds-input"
                  value={form.name}
                  onChange={(e) => f("name", e.target.value)}
                  placeholder="e.g. Longsword"
                />
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <label
                  style={{ display: "flex", flexDirection: "column", gap: 4 }}
                >
                  <span className="ds-label">Quantity</span>
                  <input
                    className="ds-input"
                    type="number"
                    min={1}
                    value={form.quantity}
                    onChange={(e) =>
                      f("quantity", Number.parseInt(e.target.value) || 1)
                    }
                  />
                </label>
                <label
                  style={{ display: "flex", flexDirection: "column", gap: 4 }}
                >
                  <span className="ds-label">Weight</span>
                  <input
                    className="ds-input"
                    value={form.weight}
                    onChange={(e) => f("weight", e.target.value)}
                    placeholder="e.g. 3 lbs"
                  />
                </label>
              </div>
              <label
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <span className="ds-label">Description</span>
                <textarea
                  className="ds-input"
                  value={form.description}
                  onChange={(e) => f("description", e.target.value)}
                  rows={2}
                  style={{ resize: "vertical" }}
                />
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={form.equipped}
                  onChange={(e) => f("equipped", e.target.checked)}
                />
                <span style={{ color: "var(--ds-text)", fontSize: 14 }}>
                  Currently Equipped
                </span>
              </label>
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 20,
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                className="ds-btn-ghost"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ds-btn-primary"
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                style={{ fontFamily: "Cinzel, serif" }}
              >
                {saving ? "Saving..." : editing ? "Save Changes" : "Add Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
