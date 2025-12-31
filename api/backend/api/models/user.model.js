// not required, but keep in mind if I want mongoose


export function buildUser(dToken) {
  return{
    uid: dToken.uid,
    email: dToken.email ?? null,
    displayName : dToken.name ?? null,
    createdAt: new Date(),
    lastLoginAt: new Date()
  };
}