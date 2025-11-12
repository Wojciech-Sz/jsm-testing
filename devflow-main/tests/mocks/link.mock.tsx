const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
  return <a href={href}>{children}</a>;
};

export { MockLink };
