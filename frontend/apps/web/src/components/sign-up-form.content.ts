import { t, type Dictionary } from "intlayer";

const signUpFormDictionary = {
  key: "sign-up-form",
  content: {
    title: t({
      en: "Create Account",
      fr: "Créer un compte",
    }),
    fields: {
      name: {
        label: t({ en: "Name", fr: "Nom" }),
        errorMin: t({
          en: "Name must be at least 2 characters",
          fr: "Le nom doit comporter au moins 2 caractères",
        }),
      },
      email: {
        label: t({ en: "Email", fr: "E-mail" }),
        errorInvalid: t({ en: "Invalid email address", fr: "Adresse e-mail invalide" }),
      },
      password: {
        label: t({ en: "Password", fr: "Mot de passe" }),
        errorMin: t({
          en: "Password must be at least 8 characters",
          fr: "Le mot de passe doit comporter au moins 8 caractères",
        }),
      },
    },
    submit: t({ en: "Sign Up", fr: "S'inscrire" }),
    submitting: t({ en: "Submitting...", fr: "Envoi..." }),
    alreadyHaveAccount: t({
      en: "Already have an account? Sign In",
      fr: "Vous avez déjà un compte ? Se connecter",
    }),
    successMessage: t({
      en: "Sign up successful. Check your email to verify your account.",
      fr: "Inscription réussie. Vérifiez votre e-mail pour vérifier votre compte.",
    }),
  },
} satisfies Dictionary;

export default signUpFormDictionary;
