:::

```tsx [6-15]
export default function InvoiceRoute() {
  const invoice = useLoaderData();
  return <Invoice data={invoice} />;
}
```

---

```tsx [6-15]
export default function InvoiceRoute() {
  const invoice = useLoaderData();
  return <Invoice data={invoice} />;
}

export function ErrorBoundary() {
  let error = useRouteError();
  console.error(error);
  return (
    <div>
      <h2>Oh snap!</h2>
      <p>
        There was a problem loading this invoice
      </p>
    </div>
  );
}
```

---

```tsx
export default function InvoiceRoute() {
  const invoice = useLoaderData();
  return <Invoice data={invoice} />;
}
```

:::
