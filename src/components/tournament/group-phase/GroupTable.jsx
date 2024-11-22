import PropTypes from 'prop-types';
export const GroupTable = ({ group }) => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-4 py-2">Posición</th>
              <th className="px-4 py-2">Título</th>
              <th className="px-4 py-2">Autor</th>
              <th className="px-4 py-2">Votos</th>
            </tr>
          </thead>
          <tbody>
            {group.map((drawing, index) => (
              <tr key={drawing.id}>
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{drawing.title}</td>
                <td className="px-4 py-2">{drawing.author}</td>
                <td className="px-4 py-2">{drawing.votes || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  GroupTable.propTypes = {
    group: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        title: PropTypes.string.isRequired,
        author: PropTypes.string.isRequired,
        votes: PropTypes.number,
        image: PropTypes.string.isRequired
      })
    ).isRequired
  };