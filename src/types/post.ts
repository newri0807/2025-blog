export interface Post {
    id: number;
    title: string;
    content: string;
    excerpt: string;
    tags: string[];
    isPinned: boolean;
    authorId: string;
    authorName: string;
    createdAt: string;
    updatedAt: string;
}

export interface Tag {
    id: number;
    name: string;
    count: number;
}
