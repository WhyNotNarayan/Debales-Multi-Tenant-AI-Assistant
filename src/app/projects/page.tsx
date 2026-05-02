import { getSession } from '@/lib/auth';
import { Project } from '@/models/Project';
import connectToDatabase from '@/lib/mongodb';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { LayoutGrid, ArrowRight } from 'lucide-react';

export default async function ProjectsPage() {
  const user = await getSession();
  await connectToDatabase();

  // In this demo, users are assigned to one project, but we'll fetch it
  const projects = await Project.find({ _id: user?.projectId });

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-secondary">Select Workspace</h1>
          <p className="text-muted-foreground text-lg">Choose a project to start collaborating with AI.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link key={project._id.toString()} href={`/chat?projectId=${project._id}`}>
              <Card className="group hover:border-primary transition-all cursor-pointer overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-5 h-5 text-primary" />
                </div>
                <CardHeader>
                  <div className="p-2 bg-primary/10 w-fit rounded-lg mb-2">
                    <LayoutGrid className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription>
                    {project.slug} workspace
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
          
          {projects.length === 0 && (
            <p className="col-span-full text-center py-12 text-muted-foreground italic">
              No projects found for your account.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
