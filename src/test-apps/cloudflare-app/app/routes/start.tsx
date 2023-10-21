export default function Start() {
  const now = new Date();
  const hour = now.getHours();
  let greeting = "こんにちは";
  if (hour < 5 || hour > 17) {
    greeting = "こんばんは";
  } else if (hour >= 5 && hour < 12) {
    greeting = "おはよう";
  }
  return (
    <div className="flex flex-col items-center">
      <h1 className="font-noto-sans-jp text-6xl">
        {new Intl.DateTimeFormat("ja", { weekday: "long" }).format(now)}
      </h1>
      <h2 className="font-noto-sans-jp text-3xl">
        {new Intl.DateTimeFormat("ja", { dateStyle: "long" }).format(now)}
      </h2>
      <h3 className="font-noto-sans-jp text-xl">{greeting}, Aydrian さん</h3>
    </div>
  );
}
