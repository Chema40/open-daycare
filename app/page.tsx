import { cookies } from "next/headers";
import HomeFeed from "@/app/home-feed";
import { createClient } from "@/utils/supabase/server";

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: todos } = await supabase.from("todos").select();

  return (
    <>
      <HomeFeed />
      {todos && todos.length > 0 ? (
        <ul aria-label="Todos">
          {todos.map((todo) => (
            <li key={todo.id}>{todo.name}</li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
