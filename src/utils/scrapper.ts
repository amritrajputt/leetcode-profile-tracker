export interface ScraperResult {
    totalSolved: number;
    easySolved?: number;
    mediumSolved?: number;
    hardSolved?: number;
}


export async function leetcodeScrapper(userName: string): Promise<ScraperResult> {
    const query = `
        query getUserProfile($username:String!){
            matchedUser(username:$username){
                submitStats{
                    acSubmissionNum{
                        difficulty
                        count
                    }
                }
            }
        }`;

    try {
        const response = await fetch("https://leetcode.com/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Referer": "https://leetcode.com/",
            },
            body: JSON.stringify({
                query,
                variables: { username: userName },
            }),
        });

        if (!response.ok) {
            throw new Error(`LeetCode API error: ${response.status}`);
        }

        const json = (await response.json()) as any;
        
        if (!json.data || !json.data.matchedUser) {
            console.log(`LeetCode user ${userName} not found.`);
            return { totalSolved: 0 };
        }

        const stats = json.data.matchedUser.submitStats.acSubmissionNum;

        
        const totalSolved = stats.find((s: any) => s.difficulty === "All")?.count || 0;
        const easySolved = stats.find((s: any) => s.difficulty === "Easy")?.count || 0;
        const mediumSolved = stats.find((s: any) => s.difficulty === "Medium")?.count || 0;
        const hardSolved = stats.find((s: any) => s.difficulty === "Hard")?.count || 0;

        return {
            totalSolved,
            easySolved,
            mediumSolved,
            hardSolved,
        };

    } catch (error) {
        console.error("Error fetching LeetCode data:", error);
        return { totalSolved: 0 };
    }
}

export async function gfgScrapper(userName: string): Promise<ScraperResult> {
    try {
        const response = await fetch(`https://www.geeksforgeeks.org/user/${userName}/`, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
            }
        });

        if (!response.ok) {
            throw new Error(`GFG API error: ${response.status}`);
        }

        const html = await response.text();
        
        const match = html.match(/\\?"total_problems_solved\\?":(\d+)/);
        
        if (match && match[1]) {
            return {
                totalSolved: parseInt(match[1], 10)
            };
        }
        
        console.log(`GFG user ${userName} not found or data missing.`);
        return { totalSolved: 0 };
    } catch (error) {
        console.error("Error fetching GeeksforGeeks data:", error);
        return { totalSolved: 0 };
    }
}