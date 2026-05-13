import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { TransactionListRow } from "@/components/app/transaction-list-row";

describe("TransactionListRow semantics", () => {
  it("marks interactive rows explicitly when requested", () => {
    const markup = renderToStaticMarkup(
      <TransactionListRow
        title="Internet"
        categoryName="Servicios"
        amount="20000"
        type="expense"
        interactive
      />,
    );

    expect(markup).toContain("data-interactive=\"true\"");
  });
});
