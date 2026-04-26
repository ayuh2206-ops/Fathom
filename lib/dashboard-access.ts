import "server-only"

import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-auth"
import { getOptionalServerSession } from "@/lib/server-session"
import { cookies } from "next/headers"

export const ADMIN_DASHBOARD_ORGANIZATION_ID = "__fathom_internal_admin__"
export const ADMIN_DASHBOARD_USER_ID = "__fathom_internal_admin__"

export type DashboardAccessContext = {
    userId: string
    organizationId: string
    isAdmin: boolean
}

export async function getDashboardAccessContext(): Promise<DashboardAccessContext | null> {
    const session = await getOptionalServerSession()

    if (session?.user?.id && session.user.organizationId) {
        return {
            userId: session.user.id,
            organizationId: session.user.organizationId,
            isAdmin: false,
        }
    }

    const adminToken = cookies().get(ADMIN_SESSION_COOKIE)?.value

    if (verifyAdminSessionToken(adminToken)) {
        return {
            userId: ADMIN_DASHBOARD_USER_ID,
            organizationId: ADMIN_DASHBOARD_ORGANIZATION_ID,
            isAdmin: true,
        }
    }

    return null
}
