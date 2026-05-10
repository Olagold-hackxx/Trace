export function TransactionRow({
  transaction
}: {
  transaction: {
    id: string;
    type: string;
    counterparty: string;
    amount: string;
    status: string;
    time: string;
  };
}) {
  return (
    <tr>
      <td>{transaction.type}</td>
      <td>{transaction.counterparty}</td>
      <td>{transaction.amount}</td>
      <td>{transaction.status}</td>
      <td>{transaction.time}</td>
    </tr>
  );
}
