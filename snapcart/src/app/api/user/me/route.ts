import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDb();
        const session = await auth();

        if (!session?.user?.email) {
            // No session: return 200 with null so client can handle gracefully
            return NextResponse.json({ user: null, message: "not authenticated" }, { status: 200 });
        }

        const user = await User.findOne({ email: session.user.email }).select("-password");

        if (!user) {
            // No user in DB: also return 200 with null to avoid client errors
            return NextResponse.json({ user: null, message: "user not found" }, { status: 200 });
        }

        return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: `get me error ${error}` }, { status: 500 });
    }
}