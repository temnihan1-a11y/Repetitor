import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const users = [
  { id: '1', email: 'admin@example.com', password: 'password', role: 'admin' },
  { id: '2', email: 'student@example.com', password: 'password', role: 'student' }
];

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'admin@example.com' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }

        const user = users.find(
          (user) => user.email === credentials.email && user.password === credentials.password
        );

        if (!user) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role
        };
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/auth/signin'
  },
  secret: process.env.NEXTAUTH_SECRET
});

export { handler as GET, handler as POST };
