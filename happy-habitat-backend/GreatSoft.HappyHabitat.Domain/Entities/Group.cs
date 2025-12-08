using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GreatSoft.HappyHabitat.Domain.Entities
{
    public class Group
    {
        public Guid Id { get; private set; } = Guid.NewGuid();
        public string Name { get; private set; }
        public string Description { get; private set; }

        public ICollection<User> Members { get; private set; } = new List<User>();

        public Group(string name, string description)
        {
            Name = name;
            Description = description;
        }
    }

}
