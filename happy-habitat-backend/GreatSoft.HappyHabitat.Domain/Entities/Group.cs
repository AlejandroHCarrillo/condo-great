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

        // Protected parameterless constructor for EF Core
        protected Group() { }

        public Group(string name, string description)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Group name cannot be null or empty", nameof(name));
            
            if (name.Length > 200)
                throw new ArgumentException("Group name cannot exceed 200 characters", nameof(name));

            if (description != null && description.Length > 1000)
                throw new ArgumentException("Group description cannot exceed 1000 characters", nameof(description));

            Name = name;
            Description = description ?? string.Empty;
        }

        public void UpdateName(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Group name cannot be null or empty", nameof(name));
            
            if (name.Length > 200)
                throw new ArgumentException("Group name cannot exceed 200 characters", nameof(name));

            Name = name;
        }

        public void UpdateDescription(string description)
        {
            if (description != null && description.Length > 1000)
                throw new ArgumentException("Group description cannot exceed 1000 characters", nameof(description));

            Description = description ?? string.Empty;
        }

        public void AddMember(User user)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user));

            if (!Members.Contains(user))
            {
                Members.Add(user);
            }
        }

        public void RemoveMember(User user)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user));

            Members.Remove(user);
        }
    }

}
