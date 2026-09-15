const AUTH_KEY = 'medicore_auth_session';

export const getAuthSession = () => {
  try {
    const session = localStorage.getItem(AUTH_KEY);

    if (!session) {
      return null;
    }

    return JSON.parse(session);
  } catch (error) {
    console.error(
      'Unable to read auth session:',
      error
    );

    return null;
  }
};

export const loginUser = (
  identifier,
  password
) => {
  const validIdentifier =
    identifier === 'staff@medicore.com' ||
    identifier === 'staff';

  const validPassword =
    password === 'medicore123';

  if (!validIdentifier || !validPassword) {
    return {
      success: false,
      message:
        'Invalid username/email or password.',
    };
  }

  const session = {
    name: 'MediCore Pharmacist',
    email: 'staff@medicore.com',
    loginAt: new Date().toISOString(),
  };

  localStorage.setItem(
    AUTH_KEY,
    JSON.stringify(session)
  );

  return {
    success: true,
    session,
  };
};

export const logoutUser = () => {
  localStorage.removeItem(AUTH_KEY);
};