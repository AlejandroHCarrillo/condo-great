using GreatSoft.HappyHabitat.Domain.Entities;
using Xunit;

namespace GreatSoft.HappyHabitat.Tests
{
    public class GroupTests
    {
        [Fact]
        public void CreateGroup_WithValidData_ShouldSucceed()
        {
            // Arrange
            var name = "Test Group";
            var description = "Test Description";

            // Act
            var group = new Group(name, description);

            // Assert
            Assert.Equal(name, group.Name);
            Assert.Equal(description, group.Description);
            Assert.NotEqual(Guid.Empty, group.Id);
            Assert.Empty(group.Members);
        }

        [Fact]
        public void CreateGroup_WithEmptyName_ShouldThrowArgumentException()
        {
            // Arrange & Act & Assert
            Assert.Throws<ArgumentException>(() => new Group("", "Description"));
            Assert.Throws<ArgumentException>(() => new Group("   ", "Description"));
            Assert.Throws<ArgumentException>(() => new Group(null!, "Description"));
        }

        [Fact]
        public void CreateGroup_WithNameTooLong_ShouldThrowArgumentException()
        {
            // Arrange
            var longName = new string('A', 201);

            // Act & Assert
            Assert.Throws<ArgumentException>(() => new Group(longName, "Description"));
        }

        [Fact]
        public void UpdateName_WithValidName_ShouldSucceed()
        {
            // Arrange
            var group = new Group("Old Name", "Description");

            // Act
            group.UpdateName("New Name");

            // Assert
            Assert.Equal("New Name", group.Name);
        }

        [Fact]
        public void AddMember_ShouldAddUserToMembers()
        {
            // Arrange
            var group = new Group("Test Group", "Description");
            var user = new User("testuser", "test@example.com");

            // Act
            group.AddMember(user);

            // Assert
            Assert.Single(group.Members);
            Assert.Contains(user, group.Members);
        }
    }

    public class UserTests
    {
        [Fact]
        public void CreateUser_WithValidData_ShouldSucceed()
        {
            // Arrange
            var username = "testuser";
            var email = "test@example.com";

            // Act
            var user = new User(username, email);

            // Assert
            Assert.Equal(username, user.Username);
            Assert.Equal(email, user.Email);
            Assert.NotEqual(Guid.Empty, user.Id);
            Assert.Empty(user.Groups);
        }

        [Fact]
        public void CreateUser_WithInvalidEmail_ShouldThrowArgumentException()
        {
            // Arrange & Act & Assert
            Assert.Throws<ArgumentException>(() => new User("testuser", "invalid-email"));
            Assert.Throws<ArgumentException>(() => new User("testuser", "notanemail"));
            Assert.Throws<ArgumentException>(() => new User("testuser", "@example.com"));
        }

        [Fact]
        public void CreateUser_WithEmptyUsername_ShouldThrowArgumentException()
        {
            // Arrange & Act & Assert
            Assert.Throws<ArgumentException>(() => new User("", "test@example.com"));
            Assert.Throws<ArgumentException>(() => new User("   ", "test@example.com"));
            Assert.Throws<ArgumentException>(() => new User(null!, "test@example.com"));
        }

        [Fact]
        public void UpdateEmail_WithValidEmail_ShouldSucceed()
        {
            // Arrange
            var user = new User("testuser", "old@example.com");

            // Act
            user.UpdateEmail("new@example.com");

            // Assert
            Assert.Equal("new@example.com", user.Email);
        }
    }
}