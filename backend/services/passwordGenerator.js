import bcrypt from 'bcryptjs'

export const passwordGenerator = async () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!#$%';
  const allChars = chars + numbers + symbols;

  let password = [
    chars[Math.floor(Math.random() * chars.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    symbols[Math.floor(Math.random() * symbols.length)]
  ];

  while (password.length < 8) {
    password.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }

  password = password.sort(() => Math.random() - 0.5).join('');

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  return {
    rawPassword: password,  
    hashedPassword: hashedPassword
  };
}