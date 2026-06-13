/**
 * Database unit tests — exercise the REAL IndexedDBWrapper (src/lib/db.ts)
 * against an in-memory IndexedDB (fake-indexeddb, installed in test setup).
 *
 * (The previous version mocked IndexedDB and asserted on the mocks.)
 */

import { describe, it, expect, beforeEach } from "vitest";
import { db } from "@/lib/db";
import * as vault from "@/lib/vault";

beforeEach(async () => {
  vault.lock();
  localStorage.clear();
  // Start each test from a clean database.
  await db.deleteDatabase().catch(() => undefined);
});

describe("db: CRUD on a non-encrypted store", () => {
  it("put + get round-trips", async () => {
    await db.put("safePoints", {
      id: "sp1",
      alcaldia: "Cuauhtémoc",
      isActive: true,
    });
    const res = await db.get<{ id: string; alcaldia: string }>(
      "safePoints",
      "sp1",
    );
    expect(res.success).toBe(true);
    expect(res.data?.alcaldia).toBe("Cuauhtémoc");
  });

  it("getAll returns everything; delete removes one; count reflects it", async () => {
    await db.put("contacts", { id: "c1", role: "legal", priority: 1 });
    await db.put("contacts", { id: "c2", role: "medical", priority: 2 });
    const all = await db.getAll<{ id: string }>("contacts");
    expect(all.data?.length).toBe(2);

    await db.delete("contacts", "c1");
    const count = await db.count("contacts");
    expect(count.data).toBe(1);
  });

  it("getByIndex queries an index", async () => {
    await db.put("contacts", {
      id: "c1",
      role: "legal",
      priority: 1,
      isAvailable: true,
    });
    await db.put("contacts", {
      id: "c2",
      role: "legal",
      priority: 2,
      isAvailable: true,
    });
    await db.put("contacts", {
      id: "c3",
      role: "medical",
      priority: 1,
      isAvailable: true,
    });
    const legal = await db.getByIndex<{ id: string }>(
      "contacts",
      "role",
      "legal",
    );
    expect(legal.data?.length).toBe(2);
  });
});

describe("db: encrypted stores are ciphertext-only at rest", () => {
  it("stores ONLY {keyPath, __encrypted} — no plaintext fields leak", async () => {
    await vault.createVault("master-pass-123");
    await db.put("incidents", {
      id: "INC-1",
      threatLevel: "critical",
      location: { colonia: "Centro" },
      notes: "desalojo en curso",
    });

    // Read the raw record straight out of IndexedDB, bypassing decryption.
    const raw = await new Promise<Record<string, unknown>>(
      (resolve, reject) => {
        const open = indexedDB.open("ProtocoloCDMX");
        open.onsuccess = () => {
          const database = open.result;
          const tx = database.transaction(["incidents"], "readonly");
          const req = tx.objectStore("incidents").get("INC-1");
          req.onsuccess = () => {
            const value = req.result;
            database.close(); // release the connection so deleteDatabase() won't block
            resolve(value);
          };
          req.onerror = () => {
            database.close();
            reject(req.error);
          };
        };
        open.onerror = () => reject(open.error);
      },
    );

    expect(raw.id).toBe("INC-1");
    expect(typeof raw.__encrypted).toBe("string");
    // None of the sensitive plaintext fields may be present.
    expect(raw.notes).toBeUndefined();
    expect(raw.threatLevel).toBeUndefined();
    expect(raw.location).toBeUndefined();
    expect(JSON.stringify(raw)).not.toContain("desalojo en curso");
  });

  it("decrypts back to the original when unlocked", async () => {
    await vault.createVault("master-pass-123");
    await db.put("incidents", {
      id: "INC-2",
      threatLevel: "high",
      location: { colonia: "Roma" },
      notes: "secreto",
    });
    const res = await db.get<{ id: string; notes: string }>(
      "incidents",
      "INC-2",
    );
    expect(res.data?.notes).toBe("secreto");
  });

  it("refuses to write an encrypted store while the vault is locked (fail-closed)", async () => {
    await vault.createVault("master-pass-123");
    vault.lock();
    await expect(
      db.put("incidents", { id: "INC-3", notes: "x" }),
    ).rejects.toBeTruthy();
  });
});
