import { User, useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";

import MakeTodo from "@/components/MakeTodo";
import Navbar from "@/components/Navbar";
import Todos from "@/components/Todos";

export type Todo = {
  id: number;
  title: string;
  completed: boolean;
  date: Date;
};

export type NewTodo = {
  title: string;
  date: Date;
};


export default function Home() {
  const sb = useSupabaseClient();
  const user: User | null = useUser()

  const [loading, setLoading] = useState(false);
  const [todos, setTodos] = useState<Todo[]>([]);
  const handleSubmit = async (todo: NewTodo) => {
    
    if (!user) {
      alert("please login first")
      return
    }
    const res = await sb.from("tasks").insert([
      {
        title: todo.title,
        completed: false,
        date: todo.date,
        user_id: user.id,
      },
    ]).select();
    if (res.error) {
      console.log(res.error)
      alert("error, please try again")
    }

    

    // get real id from supabase, and set the todo id to the real id
    if (!res.data) return;
    const realId = res.data[0].id;

    setTodos([
      ...todos,
      {
        id: realId,
        title: todo.title,
        completed: false,
        date: todo.date,
      },
    ]);

    // setTodos(
    //   todos.map((todo) => {
    //     if (todo.id === -1) {
    //       return {
    //         ...todo,
    //         id: realId,
    //       };
    //     }
    //     return todo;
    //   })
    // );
  }

  useEffect(() => {
    const fetchTodos = async () => {
      setLoading(true);
      const { data: todos, error } = await sb.from("tasks").select("*");
      if (error) {
        console.error(error);
      } else {
        const newtodos: Todo[] = todos.map((todo) => ({
          id: todo.id,
          title: todo.title,
          completed: todo.completed,
          date: new Date(todo.date),
        })).filter((todo) => !todo.completed);


        setTodos(newtodos || []);
      }
      setLoading(false);
    };
    fetchTodos();
  }
  , [sb]);

  return (
    <div className="w-[100vw] max-h-[100vh] flex flex-col justify-center items-between">
      <Navbar />
      {loading ? <p>Loading...</p> : 
      <>
        <Todos todos={todos} setTodos={setTodos}/>
        <MakeTodo handleSubmit={handleSubmit} />
        </>
      }
    </div>
  );
}
