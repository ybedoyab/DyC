import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Politician } from '../models/Politician';

// Configuración de la estrategia de Google OAuth
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: `${process.env.API_URL || 'http://localhost:3001'}/api/auth/oauth/google/callback`,
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

        if (!email) {
          return done(new Error('Email no disponible en el perfil de Google'), false);
        }

        // Buscar político en la base de datos
        const politician = await Politician.findOne({
          email: email.toLowerCase(),
          isActive: true
        });

        if (!politician) {
          // NO crear político automáticamente
          // Solo el admin puede agregar emails
          return done(new Error('Email no autorizado. Contacta al administrador.'), false);
        }

        // Actualizar información OAuth si ya existe
        politician.oauthProvider = 'google';
        politician.oauthId = profile.id;
        politician.updatedBy = 'google_oauth';
        await politician.save();

        return done(null, politician);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Serialización del usuario para la sesión
passport.serializeUser((user: any, done) => {
  done(null, user.uuid); // Serialize by UUID
});

// Deserialización del usuario desde la sesión
passport.deserializeUser(async (uuid: string, done) => {
  try {
    const politician = await Politician.findOne({ uuid: uuid, isActive: true });
    done(null, politician);
  } catch (error) {
    done(error, false);
  }
});

export default passport;
