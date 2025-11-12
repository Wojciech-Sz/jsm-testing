import { MockImage } from "@/tests/mocks/image.mock";

interface MetricProps {
  imgUrl: string;
  alt: string;
  value: number;
  title: string;
  textStyles?: string;
}

const MockMetric = ({ imgUrl, alt, value, title, textStyles }: MetricProps) => {
  return (
    <div className={textStyles} data-testid="metric">
      <MockImage src={imgUrl} alt={alt} />
      {value} {title}
    </div>
  );
};

export { MockMetric };
