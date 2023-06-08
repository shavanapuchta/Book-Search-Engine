const { User } = require('../models');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (!context.user) {
                throw new Error('Authentication token not provided');
            }

            try {
                const userId = context.user._id;
                const user = await User.findById(userId);

                if (!user) {
                    throw new Error('User not found');
                }

                return user;
            } catch (error) {
                throw new Error('Failed to fetch user');
            }
        },
    },
    Mutation: {
        login: async (parent, { email, password }) => {
            try {
                // Find the user based on the provided email
                const user = await User.findOne({ email });

                if (!user) {
                    throw new Error('Invalid email or password');
                }

                // Check if the provided password matches the user's password
                const correctPassword = await user.isCorrectPassword(password);

                if (!correctPassword) {
                    throw new Error('Invalid email or password');
                }

                // Generate a JSON web token (JWT) for the authenticated user
                const token = signToken(user);

                // Return the token and user data as the result
                return { token, user };
            } catch (error) {
                throw new Error('Failed to perform login');
            }
        },

        addUser: async (parent, args) => {
            try {
              // Destructure the arguments
              const { username, email, password } = args;
      
              // Create new user
              const user = await User.create({ username, email, password });
      
              const token = signToken(user);
      
              return { token, user };
            } catch (error) {
              throw new Error('Failed to create user');
            }
          },

          saveBook: async (parent, { book }, context) => {
            try {
             
              const { authors, description, title, bookId, image, link } = book;
      
              if (!context.user) {
                throw new Error('Authentication token not provided');
              }
      
              const userId = context.user._id;
      
              const user = await User.findById(userId);
      
              if (!user) {
                throw new Error('User not found');
              }
      
              // Check if the book is already saved by checking its bookId
              const bookExists = user.savedBooks.some((savedBook) => savedBook.bookId === bookId);
      
              if (bookExists) {
                throw new Error('Book already saved');
              }
      
              // Add the new book to the user's savedBooks array
              user.savedBooks.push({ authors, description, title, bookId, image, link });
      
              // Save the changes to the user
              await user.save();
      
              // Return the updated user data as the result
              return user;
            } catch (error) {
              throw new Error('Failed to save book');
            }
          },
          removeBook: async (parent, { bookId }, context) => {
            try {
              if (!context.user) {
                throw new Error('Authentication token not provided');
              }
      
              const userId = context.user._id;
      
              const user = await User.findById(userId);
      
              if (!user) {
                throw new Error('User not found');
              }
      
              // Find the index of the book to be removed in the user's savedBooks array
              const bookIndex = user.savedBooks.findIndex((savedBook) => savedBook.bookId === bookId);
      
              if (bookIndex === -1) {
                throw new Error('Book not found');
              }
      
              // Remove the book from the user's savedBooks array
              user.savedBooks.splice(bookIndex, 1);
      
              // Save the changes to the user
              await user.save();
      
              // Return the updated user data as the result
              return user;
            } catch (error) {
              throw new Error('Failed to remove book');
            }
          },
    },

};

    module.exports = resolvers;