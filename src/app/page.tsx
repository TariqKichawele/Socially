import { currentUser } from "@clerk/nextjs/server";
import CreatePost from "@/components/CreatePost";

export default async function Home() {
  const user = await currentUser();
  const posts = [];
  
  return (
    <>
       <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          <div className="lg:col-span-6">
            {user ? <CreatePost /> : null}

            <div className="space-y-6">
              PostCard
            </div>
          </div>

        <div className="hidden lg:block lg:col-span-4 sticky top-20">
          Who To Follow
        </div>
    </div>
    </>
  );
}
