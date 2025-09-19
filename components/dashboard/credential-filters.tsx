"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X } from "lucide-react"

interface FilterState {
  search: string
  type: string
  status: string
  dateRange: string
}

export function CredentialFilters() {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    type: "all",
    status: "all",
    dateRange: "all"
  })

  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    
    // Update active filters
    if (value !== "all" && value !== "") {
      if (!activeFilters.includes(key)) {
        setActiveFilters(prev => [...prev, key])
      }
    } else {
      setActiveFilters(prev => prev.filter(f => f !== key))
    }
  }

  const clearFilter = (key: string) => {
    setFilters(prev => ({ ...prev, [key]: key === "search" ? "" : "all" }))
    setActiveFilters(prev => prev.filter(f => f !== key))
  }

  const clearAllFilters = () => {
    setFilters({
      search: "",
      type: "all",
      status: "all",
      dateRange: "all"
    })
    setActiveFilters([])
  }

  const getFilterLabel = (key: string) => {
    const labels = {
      search: `Search: "${filters.search}"`,
      type: `Type: ${filters.type}`,
      status: `Status: ${filters.status}`,
      dateRange: `Date: ${filters.dateRange}`
    }
    return labels[key as keyof typeof labels] || key
  }

  return (
    <Card className="bg-gray-800/50 border-purple-500/20 p-6">
      <div className="space-y-4">
        {/* Search and Filter Row */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search credentials..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-10 bg-gray-700/50 border-purple-500/20 text-white placeholder-gray-400"
            />
          </div>

          <div className="flex gap-2">
            <Select value={filters.type} onValueChange={(value) => handleFilterChange("type", value)}>
              <SelectTrigger className="w-[140px] bg-gray-700/50 border-purple-500/20 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-purple-500/20">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="license">License</SelectItem>
                <SelectItem value="certificate">Certificate</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger className="w-[140px] bg-gray-700/50 border-purple-500/20 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-purple-500/20">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange("dateRange", value)}>
              <SelectTrigger className="w-[140px] bg-gray-700/50 border-purple-500/20 text-white">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-purple-500/20">
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-400">Active filters:</span>
            {activeFilters.map((filter) => (
              <Badge
                key={filter}
                variant="outline"
                className="bg-purple-500/20 text-purple-300 border-purple-500/30 pr-1"
              >
                {getFilterLabel(filter)}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearFilter(filter)}
                  className="ml-1 p-0 h-4 w-4 hover:bg-purple-500/30"
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-gray-400 hover:text-white"
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-400 mr-2">Quick filters:</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFilterChange("status", "verified")}
            className={`text-xs ${filters.status === "verified" ? "bg-green-500/20 text-green-300" : "text-gray-400"}`}
          >
            Verified Only
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFilterChange("type", "education")}
            className={`text-xs ${filters.type === "education" ? "bg-blue-500/20 text-blue-300" : "text-gray-400"}`}
          >
            Education
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFilterChange("type", "professional")}
            className={`text-xs ${filters.type === "professional" ? "bg-purple-500/20 text-purple-300" : "text-gray-400"}`}
          >
            Professional
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFilterChange("dateRange", "month")}
            className={`text-xs ${filters.dateRange === "month" ? "bg-yellow-500/20 text-yellow-300" : "text-gray-400"}`}
          >
            This Month
          </Button>
        </div>
      </div>
    </Card>
  )
}
