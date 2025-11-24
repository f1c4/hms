interface HeadingProps {
  title?: string | null;
  description?: string;
  number?: number;
  icon?: React.ReactNode;
  image?: string;
}

export const Heading: React.FC<HeadingProps> = ({
  title,
  description,
  number,
  icon,
}) => {
  return (
    <div>
      <h2 className="flex items-center text-3xl font-bold tracking-normal text-foreground">
        {icon ? <span className="mr-2">{icon}</span> : null}
        {title}
        {number ? <span className="ml-2">({number})</span> : null}
      </h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};
