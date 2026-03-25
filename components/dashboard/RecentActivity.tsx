import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const activity = [
    {
        user: { name: "System", image: "/avatars/system.png" },
        action: "flagged Invoice #INV-2024-001",
        target: "Suspicious Detention Charge",
        time: "2 minutes ago",
        type: "alert"
    },
    {
        user: { name: "Sarah Chen", image: "/avatars/02.png" },
        action: "approved dispute",
        target: "Maersk Line / #DSP-992",
        time: "1 hour ago",
        type: "success"
    },
    {
        user: { name: "System", image: "/avatars/system.png" },
        action: "detected route deviation",
        target: "Vessel: EVER GIVEN",
        time: "3 hours ago",
        type: "warning"
    },
    {
        user: { name: "John Doe", image: "/avatars/01.png" },
        action: "uploaded invoice",
        target: "INV-2024-004.pdf",
        time: "5 hours ago",
        type: "info"
    },
]

export function RecentActivity() {
    return (
        <div className="space-y-8">
            {activity.map((item, index) => (
                <div key={index} className="flex items-center">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={item.user.image} alt={item.user.name} />
                        <AvatarFallback className="text-xs">{item.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none text-white">
                            {item.user.name} <span className="text-slate-400 font-normal">{item.action}</span>
                        </p>
                        <p className="text-xs text-slate-500">
                            {item.target}
                        </p>
                    </div>
                    <div className="ml-auto font-medium text-xs text-slate-500">
                        {item.time}
                    </div>
                </div>
            ))}
        </div>
    )
}
