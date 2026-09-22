export type Volunteer = {
  id: string;
  name: string;
  email: string;
  token: string;
};

export function VolunteerTable({ volunteers }: { volunteers: Volunteer[] }) {
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-blue-400/20 text-blue-200/70">
          <th className="py-2 pr-4 font-medium">Name</th>
          <th className="py-2 pr-4 font-medium">Email</th>
          <th className="py-2 font-medium">Access token</th>
        </tr>
      </thead>
      <tbody>
        {volunteers.map((volunteer) => (
          <tr key={volunteer.id} className="border-b border-blue-400/10">
            <td className="py-2 pr-4">{volunteer.name}</td>
            <td className="py-2 pr-4">{volunteer.email}</td>
            <td className="py-2 font-mono text-xs">{volunteer.token}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
