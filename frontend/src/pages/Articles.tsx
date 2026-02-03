import { useState, useEffect } from "react";
import { Plus, Edit2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/services/api";
import { ArticleForm } from "@/components/articles/ArticleForm";
import { ExperiencesManager } from "@/components/articles/ExperiencesManager";

interface Article {
    article_id: number;
    titre: string;
    auteurs?: string;
    doi?: string;
}

export default function ArticlesPage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [showNewArticleForm, setShowNewArticleForm] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadArticles();
    }, []);

    const loadArticles = async () => {
        setLoading(true);
        try {
            const data = await api.getArticles();
            setArticles(data);
        } catch (error) {
            console.error("Failed to load articles:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleArticleCreated = (newArticle: Article) => {
        setArticles([...articles, newArticle]);
        setShowNewArticleForm(false);
        setSelectedArticle(newArticle);
    };

    if (selectedArticle) {
        return (
            <div className="min-h-screen bg-background">
                <div className="max-w-6xl mx-auto p-6">
                    {/* Back button */}
                    <Button
                        variant="ghost"
                        onClick={() => setSelectedArticle(null)}
                        className="mb-6"
                    >
                        ← Back to Articles
                    </Button>

                    {/* Article header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            {selectedArticle.titre}
                        </h1>
                        <p className="text-muted-foreground">
                            {selectedArticle.auteurs}
                            {selectedArticle.doi && ` • DOI: ${selectedArticle.doi}`}
                        </p>
                    </div>

                    {/* Experiences manager */}
                    <ExperiencesManager articleId={selectedArticle.article_id} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-6xl mx-auto p-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Articles</h1>
                        <p className="text-muted-foreground">Manage publications and their experiments</p>
                    </div>
                    <Button onClick={() => setShowNewArticleForm(!showNewArticleForm)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Article
                    </Button>
                </div>

                {/* New article form */}
                {showNewArticleForm && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Create New Article</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ArticleForm onSuccess={handleArticleCreated} />
                        </CardContent>
                    </Card>
                )}

                {/* Articles list */}
                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Loading articles...</p>
                    </div>
                ) : articles.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground mb-4">No articles yet</p>
                            <Button onClick={() => setShowNewArticleForm(true)}>
                                Create your first article
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {articles.map((article) => (
                            <Card
                                key={article.article_id}
                                className="cursor-pointer hover:bg-accent transition-colors"
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">{article.titre}</CardTitle>
                                            <CardDescription>{article.auteurs}</CardDescription>
                                            {article.doi && (
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    DOI: {article.doi}
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setSelectedArticle(article)}
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
