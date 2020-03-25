const dictionary = {
  incompleteCredentials: {
    en: 'Please provide email and password',
    ru: 'Пожалуйста, укажите ваш адрес электронной почты и пароль'
  },
  credentialsFail: {
    en: 'Incorrect email or password',
    ru: 'Неверные имя пользователя или пароль'
  },
  notLoggedIn: {
    en: 'You are not logged in! Please log in to get access',
    ru: 'Вы не вошли в систему! Пожалуйста, выполните вход или пройдите регистрацию'
  },
  userIsNotExists: {
    en: 'The user belonging to this token is no longer exists!',
    user: 'Пользователь с такими учетными данными отсутствует!'
  },
  changedPassword: {
    en: 'User recently changed the password! Please log in again!',
    ru: 'Похоже вы недавно сменили пароль! Пожалуйста, выполните вход заново!'
  },
  wrongEmail: {
    en: 'There is no user with this email address',
    ru: 'Пользоваель с данным адресом электронной почты отсутствует'
  },
  wrongCurrentPassword: {
    en: 'Your current password is wrong!',
    ru: 'Текущий пароль указан неверно!'
  },
  sendEmailError: {
    en: 'There was an error during the sending the email. Please, try again later',
    ru: 'Во время отправки письма на вашу почту произошла ошибка. Попробуйте выполнить данную операцию позже'
  },
  expiredToken: {
    en: 'Your token has expired. Please log in again!',
    ru: 'Ваши учетные данные просрочены. Пожалуйста, выполните вход заново!'
  },
  invalidToken: {
    en: 'Invalid token. Please log in again!',
    ru: 'Ваши учетные данные неверны. Пожалуйста, выполните вход заново!'
  },
  invalidInput: {
    en: 'Invalid input data.',
    ru: 'Неверно указанны данные'
  },
  abstractMessage: {
    en: 'Something went wrong!',
    ru: 'Что-то пошло не так! Попробуйте выполнить данную операцию позже'
  }
};

const getMessage = (message) => {
  let language;
  if (['en', 'ru'].includes(process.env.APP_LANGUAGE)) {
    language = process.env.APP_LANGUAGE;
  } else {
    language = 'en'
  }
  return dictionary[message][language];
};

module.exports = getMessage;
