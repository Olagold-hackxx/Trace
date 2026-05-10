export function LoanRow({
  loan
}: {
  loan: { title: string; amount: string; rate: string; status: string; note: string };
}) {
  return (
    <tr>
      <td>{loan.title}</td>
      <td>{loan.amount}</td>
      <td>{loan.rate}</td>
      <td>{loan.status}</td>
      <td>{loan.note}</td>
    </tr>
  );
}
