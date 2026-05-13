import { Landmark } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ResourceRowShell, ResourceSheet } from "@/components/app/resource-sheet";
import { SettingsRow } from "@/components/app/settings-list";

describe("ResourceSheet semantics", () => {
  it("avoids nested buttons when using a button trigger as child", () => {
    const markup = renderToStaticMarkup(
      <ResourceSheet title="Editar" triggerAsChild trigger={<button type="button">Abrir</button>}>
        <div>Contenido</div>
      </ResourceSheet>,
    );

    expect(markup).toContain(">Abrir<");
    expect((markup.match(/<button/g) ?? []).length).toBe(1);
    expect(markup).not.toContain("<button><button");
  });

  it("marks interactive row shells explicitly", () => {
    const markup = renderToStaticMarkup(
      <ResourceRowShell icon={<span>I</span>} title="Fila" interactive />,
    );

    expect(markup).toContain("data-interactive=\"true\"");
  });
});

describe("SettingsRow semantics", () => {
  it("renders static rows without navigation affordance", () => {
    const markup = renderToStaticMarkup(
      <SettingsRow icon={Landmark} title="Solo info" />,
    );

    expect(markup).not.toContain("<a ");
    expect(markup).not.toContain("data-interactive=\"true\"");
  });
});
